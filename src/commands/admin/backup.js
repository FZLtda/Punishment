const { EmbedBuilder } = require('discord.js');
const { yellow, green } = require('../../config/colors.json');
const { icon_attention } = require('../../config/emoji.json');
const { logModerationAction } = require('../../utils/moderationUtils');
const Backup = require('../../models/Backup');

function serializeBigInt(key, value) {
  return typeof value === 'bigint' ? value.toString() : value;
}

module.exports = {
  name: 'backup',
  description: 'Cria um backup completo do servidor no banco de dados.',
  usage: '${currentPrefix}backup',
  userPermissions: ['Administrator'],
  botPermissions: ['Administrator'],
  deleteMessage: true,

  async execute(message) {
    try {
      const guild = message.guild;

      const backupData = {
        guildName: guild.name,
        guildId: guild.id.toString(),
        roles: guild.roles.cache
          .filter(role => role.id !== guild.id)
          .sort((a, b) => b.position - a.position)
          .map(role => ({
            id: role.id?.toString() || 'N/A',
            name: role.name || 'Sem Nome',
            color: role.color || 0,
            permissions: role.permissions?.bitfield?.toString() || '0',
            position: role.position || 0,
            hoist: role.hoist || false,
            mentionable: role.mentionable || false,
          })),
        channels: guild.channels.cache
          .sort((a, b) => (a.rawPosition || 0) - (b.rawPosition || 0))
          .map(channel => ({
            id: channel.id?.toString() || 'N/A',
            name: channel.name || 'Sem Nome',
            type: channel.type || 'UNKNOWN',
            parentId: channel.parentId ? channel.parentId.toString() : null,
            position: channel.rawPosition || 0,
            permissionOverwrites: channel.permissionOverwrites?.cache
              ? channel.permissionOverwrites.cache.map(overwrite => ({
                  id: overwrite.id?.toString() || 'N/A',
                  type: overwrite.type || 'UNKNOWN',
                  allow: overwrite.allow?.bitfield?.toString() || '0',
                  deny: overwrite.deny?.bitfield?.toString() || '0',
                }))
              : [],
          })),
      };

      // [Salva no MongoDB]
      const newBackup = await Backup.create(backupData);

      // [Log]
      logModerationAction(
        message.guild.id,
        message.author.id,
        'Backup',
        newBackup._id,
        'Backup completo do servidor salvo no banco de dados'
      );

      const embed = new EmbedBuilder()
        .setTitle('<:Backup:1355721566582997054> Backup Criado com Sucesso')
        .setColor(green)
        .setDescription(`O backup foi salvo no banco de dados com sucesso!`)
        .addFields(
          { name: 'Servidor', value: guild.name, inline: true },
          { name: 'ID do Backup', value: `\`${newBackup._id.toString()}\``, inline: false }
        )
        .setFooter({
          text: `${message.author.username}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });

    } catch (error) {
      console.error(error);

      const embedErro = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({
          name: 'Não foi possível criar o backup.',
          iconURL: icon_attention
        });

      return message.channel.send({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }
  },
};
