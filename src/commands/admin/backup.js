'use strict';

const {
  EmbedBuilder,
  PermissionsBitField
} = require('discord.js');
const { colors, emojis } = require('@config');
const { sendModLog } = require('@modules/modlog');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'backup',
  description: 'Cria um backup completo da estrutura do servidor (cargos + canais).',
  usage: '${currentPrefix}backup',
  userPermissions: ['Administrator'],
  botPermissions: ['ManageGuild', 'ManageChannels', 'ManageRoles', 'ViewAuditLog'],
  deleteMessage: true,

  async execute(message) {
    try {
      const guild = message.guild;
      const timestamp = Date.now();

      const backupData = {
        backupId: timestamp,
        guildId: guild.id,
        guildName: guild.name,
        iconURL: guild.iconURL(),
        createdAt: guild.createdAt,
        region: guild.preferredLocale,
        createdBy: {
          id: message.author.id,
          tag: message.author.tag
        },
        roles: [],
        channels: []
      };

      // CARGOS
      guild.roles.cache
        .filter(role => !role.managed && role.id !== guild.id)
        .sort((a, b) => a.position - b.position)
        .forEach(role => {
          backupData.roles.push({
            id: role.id,
            name: role.name,
            color: role.hexColor,
            hoist: role.hoist,
            permissions: role.permissions.bitfield.toString(),
            position: role.position,
            mentionable: role.mentionable
          });
        });

      // CANAIS
      guild.channels.cache
        .sort((a, b) => a.position - b.position)
        .forEach(channel => {
          backupData.channels.push({
            id: channel.id,
            name: channel.name,
            type: channel.type,
            parentId: channel.parentId,
            position: channel.position,
            nsfw: 'nsfw' in channel ? channel.nsfw : false,
            permissionOverwrites: channel.permissionOverwrites.cache.map(perm => ({
              id: perm.id,
              type: perm.type,
              allow: perm.allow.bitfield.toString(),
              deny: perm.deny.bitfield.toString()
            }))
          });
        });

      const fileName = `backup-${guild.id}-${timestamp}.json`;
      const backupDir = path.join(__dirname, '../../../backups');
      const filePath = path.join(backupDir, fileName);

      fs.mkdirSync(backupDir, { recursive: true });
      fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));

      const embed = new EmbedBuilder()
        .setTitle(`${emojis.successEmoji} Backup criado com sucesso`)
        .setColor(colors.green)
        .setDescription('A estrutura do servidor foi salva com segurança.')
        .addFields(
          { name: 'Servidor', value: guild.name, inline: true },
          { name: 'Cargos salvos', value: `${backupData.roles.length}`, inline: true },
          { name: 'Canais salvos', value: `${backupData.channels.length}`, inline: true },
          { name: 'Backup ID', value: `\`${timestamp}\``, inline: false },
          { name: 'Restauração', value: `Use \`${message.client.prefix || '.'}restore ${timestamp}\` para restaurar.`, inline: false }
        )
        .setFooter({
          text: `${message.author.username}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });

      await sendModLog(guild, {
        action: 'Backup de Estrutura',
        target: message.author,
        moderator: message.author,
        reason: 'Backup manual solicitado.',
        extraFields: [
          { name: 'Cargos', value: `${backupData.roles.length}`, inline: true },
          { name: 'Canais', value: `${backupData.channels.length}`, inline: true },
          { name: 'Backup ID', value: `${timestamp}`, inline: false }
        ]
      });

    } catch (error) {
      console.error('[BACKUP ERROR]', error);
      return sendError(message, 'Erro ao criar o backup. Verifique o console para mais detalhes.');
    }
  }
};

function sendError(message, texto) {
  const embed = new EmbedBuilder()
    .setColor(colors.yellow)
    .setAuthor({ name: texto, iconURL: emojis.attentionIcon });

  return message.channel.send({
    embeds: [embed],
    allowedMentions: { repliedUser: false }
  });
}
