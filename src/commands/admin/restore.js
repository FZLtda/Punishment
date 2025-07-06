'use strict';

const {
  EmbedBuilder,
  ChannelType,
  PermissionsBitField
} = require('discord.js');
const { colors, emojis } = require('@config');
const { sendModLog } = require('@modules/modlog');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'restore',
  description: 'Restaura cargos e canais ausentes do servidor mantendo posições e hierarquia.',
  usage: '${currentPrefix}restore <backupId>',
  userPermissions: ['Administrator'],
  botPermissions: ['ManageGuild', 'ManageChannels', 'ManageRoles'],
  deleteMessage: true,

  async execute(message, args) {
    const backupId = args[0];
    if (!backupId) return sendError(message, 'Você precisa fornecer o ID do backup.');

    const fileName = `backup-${message.guild.id}-${backupId}.json`;
    const filePath = path.join(__dirname, '../../../backups', fileName);

    if (!fs.existsSync(filePath)) {
      return sendError(message, `Backup com ID \`${backupId}\` não encontrado.`);
    }

    let backupData;
    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      backupData = JSON.parse(raw);
    } catch (err) {
      console.error('[RESTORE-PARSE]', err);
      return sendError(message, 'Erro ao ler o backup. O arquivo pode estar corrompido.');
    }

    const guild = message.guild;
    const existingRoles = guild.roles.cache;
    const existingChannels = guild.channels.cache;

    const roleMap = new Map();
    const categoryMap = new Map();

    const restoredRoles = [];
    const restoredCategories = [];
    const restoredChannels = [];

    // 1. Restaurar cargos ausentes
    for (const roleData of backupData.roles.sort((a, b) => a.position - b.position)) {
      if (existingRoles.has(roleData.id)) continue;

      try {
        const role = await guild.roles.create({
          name: roleData.name,
          color: roleData.color,
          hoist: roleData.hoist,
          permissions: new PermissionsBitField(BigInt(roleData.permissions)),
          mentionable: roleData.mentionable,
          reason: `Restaurando cargo ausente do backup ${backupId}`
        });

        await role.setPosition(roleData.position).catch(() => {});
        roleMap.set(roleData.id, role.id);
        restoredRoles.push(role);
      } catch (err) {
        console.error(`[RESTORE-ROLE] ${roleData.name}:`, err.message);
      }
    }

    // 2. Restaurar categorias ausentes primeiro (para vincular canais depois)
    const categories = backupData.channels
      .filter(c => c.type === ChannelType.GuildCategory)
      .sort((a, b) => a.position - b.position);

    for (const category of categories) {
      if (existingChannels.has(category.id)) continue;

      try {
        const created = await guild.channels.create({
          name: category.name,
          type: ChannelType.GuildCategory,
          permissionOverwrites: category.permissionOverwrites.map(perm => ({
            id: roleMap.get(perm.id) || perm.id,
            type: perm.type,
            allow: new PermissionsBitField(BigInt(perm.allow)),
            deny: new PermissionsBitField(BigInt(perm.deny))
          })),
          reason: `Restaurando categoria do backup ${backupId}`
        });

        await created.setPosition(category.position).catch(() => {});
        categoryMap.set(category.id, created.id);
        restoredCategories.push(created);
      } catch (err) {
        console.error(`[RESTORE-CATEGORY] ${category.name}:`, err.message);
      }
    }

    // 3. Restaurar canais normais (textuais, de voz etc.)
    const nonCategories = backupData.channels
      .filter(c => c.type !== ChannelType.GuildCategory)
      .sort((a, b) => a.position - b.position);

    for (const channelData of nonCategories) {
      if (existingChannels.has(channelData.id)) continue;

      try {
        const created = await guild.channels.create({
          name: channelData.name,
          type: channelData.type,
          parent: categoryMap.get(channelData.parentId) || null,
          nsfw: channelData.nsfw || false,
          permissionOverwrites: channelData.permissionOverwrites.map(perm => ({
            id: roleMap.get(perm.id) || perm.id,
            type: perm.type,
            allow: new PermissionsBitField(BigInt(perm.allow)),
            deny: new PermissionsBitField(BigInt(perm.deny))
          })),
          reason: `Restaurando canal do backup ${backupId}`
        });

        await created.setPosition(channelData.position).catch(() => {});
        restoredChannels.push(created);
      } catch (err) {
        console.error(`[RESTORE-CHANNEL] ${channelData.name}:`, err.message);
      }
    }

    const embed = new EmbedBuilder()
      .setTitle(`${emojis.success} Restauração concluída`)
      .setColor(colors.green)
      .setDescription(`Itens ausentes restaurados com sucesso do backup \`${backupId}\`.`)
      .addFields(
        { name: 'Cargos restaurados', value: `${restoredRoles.length}`, inline: true },
        { name: 'Categorias restauradas', value: `${restoredCategories.length}`, inline: true },
        { name: 'Canais restaurados', value: `${restoredChannels.length}`, inline: true }
      )
      .setFooter({
        text: `Solicitado por ${message.author.tag}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });

    await sendModLog(guild, {
      action: 'Restore Estrutural',
      target: message.author,
      moderator: message.author,
      reason: `Restore de itens ausentes mantendo hierarquia (Backup ${backupId})`,
      extraFields: [
        { name: 'Cargos', value: `${restoredRoles.length}`, inline: true },
        { name: 'Categorias', value: `${restoredCategories.length}`, inline: true },
        { name: 'Canais', value: `${restoredChannels.length}`, inline: true }
      ]
    });
  }
};

function sendError(message, texto) {
  const embed = new EmbedBuilder()
    .setColor(colors.yellow)
    .setAuthor({ name: texto, iconURL: emojis.attention });

  return message.channel.send({
    embeds: [embed],
    allowedMentions: { repliedUser: false }
  });
}
