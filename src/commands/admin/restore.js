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
  description: 'Restaura a estrutura de um servidor a partir de um backup existente.',
  usage: '${currentPrefix}restore <backupId>',
  userPermissions: ['Administrator'],
  botPermissions: ['ManageGuild', 'ManageChannels', 'ManageRoles'],
  deleteMessage: true,

  async execute(message, args) {
    const backupId = args[0];
    if (!backupId) {
      return sendError(message, 'Você precisa fornecer o ID do backup.');
    }

    const fileName = `backup-${message.guild.id}-${backupId}.json`;
    const filePath = path.join(__dirname, '../../../backups', fileName);

    if (!fs.existsSync(filePath)) {
      return sendError(message, `Nenhum backup com ID \`${backupId}\` foi encontrado para este servidor.`);
    }

    let backupData;
    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      backupData = JSON.parse(raw);
    } catch (err) {
      console.error('[RESTORE-READ-ERROR]', err);
      return sendError(message, 'Erro ao ler o backup. O arquivo pode estar corrompido.');
    }

    // Confirmação de ação crítica
    await message.channel.send({
      content: `${emojis.attent} **Atenção:** Este comando irá recriar canais e cargos no servidor.\n\nRestaurando backup: \`${backupId}\``,
      allowedMentions: { repliedUser: false }
    });

    const roleMap = new Map();

    // Recria os cargos
    for (const roleData of backupData.roles.reverse()) {
      try {
        const created = await message.guild.roles.create({
          name: roleData.name,
          color: roleData.color,
          hoist: roleData.hoist,
          permissions: new PermissionsBitField(BigInt(roleData.permissions)),
          position: roleData.position,
          mentionable: roleData.mentionable,
          reason: `Restaurando backup ${backupId}`
        });
        roleMap.set(roleData.id, created.id);
      } catch (err) {
        console.error(`[RESTORE-ROLE] Erro ao criar cargo "${roleData.name}":`, err.message);
      }
    }

    const categoryMap = new Map();

    // Recria os canais
    for (const channelData of backupData.channels) {
      try {
        const overwrites = channelData.permissionOverwrites.map(perm => ({
          id: roleMap.get(perm.id) || perm.id,
          type: perm.type,
          allow: new PermissionsBitField(BigInt(perm.allow)),
          deny: new PermissionsBitField(BigInt(perm.deny))
        }));

        const createdChannel = await message.guild.channels.create({
          name: channelData.name,
          type: channelData.type,
          parent: categoryMap.get(channelData.parentId) || null,
          nsfw: channelData.nsfw || false,
          position: channelData.position,
          permissionOverwrites: overwrites,
          reason: `Restaurando backup ${backupId}`
        });

        if (createdChannel.type === ChannelType.GuildCategory) {
          categoryMap.set(channelData.id, createdChannel.id);
        }
      } catch (err) {
        console.error(`[RESTORE-CHANNEL] Erro ao criar canal "${channelData.name}":`, err.message);
      }
    }

    const embed = new EmbedBuilder()
      .setTitle(`${emojis.success} Backup restaurado com sucesso`)
      .setColor(colors.green)
      .setDescription(`O servidor foi restaurado a partir do backup \`${backupId}\`.`)
      .addFields(
        { name: 'Cargos recriados', value: `${backupData.roles.length}`, inline: true },
        { name: 'Canais recriados', value: `${backupData.channels.length}`, inline: true }
      )
      .setFooter({
        text: `${message.author.tag}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });

    await sendModLog(message.guild, {
      action: 'Restore de Backup',
      target: message.author,
      moderator: message.author,
      reason: `Restore do backup ID ${backupId}`,
      extraFields: [
        { name: 'Cargos restaurados', value: `${backupData.roles.length}`, inline: true },
        { name: 'Canais restaurados', value: `${backupData.channels.length}`, inline: true }
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
