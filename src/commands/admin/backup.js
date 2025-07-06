'use strict';

const { EmbedBuilder } = require('discord.js');
const { colors, emojis } = require('@config');
const { sendModLog } = require('@modules/modlog');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'backup',
  description: 'Cria um backup completo da estrutura do servidor.',
  usage: '${currentPrefix}backup',
  userPermissions: ['Administrator'],
  botPermissions: ['ManageGuild', 'ManageChannels', 'ManageRoles', 'ViewAuditLog'],
  deleteMessage: true,

  async execute(message) {
    try {
      const guild = message.guild;

      const backupData = {
        guildId: guild.id,
        guildName: guild.name,
        iconURL: guild.iconURL(),
        createdAt: guild.createdAt,
        region: guild.preferredLocale,
        roles: [],
        channels: [],
      };

      // Cargos
      guild.roles.cache
        .filter(role => !role.managed)
        .sort((a, b) => b.position - a.position)
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

      // Canais
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

      const timestamp = Date.now();
      const fileName = `backup-${guild.id}-${timestamp}.json`;
      const backupDir = path.join(__dirname, '../../../backups');
      const filePath = path.join(backupDir, fileName);

      fs.mkdirSync(backupDir, { recursive: true });

      fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));

      const embed = new EmbedBuilder()
        .setTitle(`${emojis.success} Backup criado com sucesso`)
        .setColor(colors.green)
        .setDescription('A estrutura do servidor foi salva com sucesso.')
        .addFields(
          { name: 'Servidor', value: guild.name, inline: true },
          { name: 'Total de Cargos', value: `${backupData.roles.length}`, inline: true },
          { name: 'Total de Canais', value: `${backupData.channels.length}`, inline: true }
        )
        .setFooter({
          text: `Backup ID: ${timestamp}`,
          iconURL: guild.iconURL()
        })
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });

      await sendModLog(guild, {
        action: 'Backup de Servidor',
        target: message.author,
        moderator: message.author,
        reason: 'Backup manual solicitado.',
        extraFields: [
          { name: 'Cargos salvos', value: `${backupData.roles.length}`, inline: true },
          { name: 'Canais salvos', value: `${backupData.channels.length}`, inline: true }
        ]
      });

    } catch (error) {
      console.error('[BACKUP ERROR]', error);
      return sendError(message, 'Não foi possível gerar o backup. Verifique o erro no console.');
    }
  }
};

function sendError(message, texto) {
  const embed = new EmbedBuilder()
    .setColor(colors.yellow)
    .setAuthor({ name: texto, iconURL: emojis.attention });

  return message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
}
