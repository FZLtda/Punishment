const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const { logModerationAction } = require('../moderationUtils');

module.exports = {
  name: 'lock',
  description: 'Bloqueia o envio de mensagens em um canal.',
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return message.reply('<:no:1122370713932795997> Você não tem permissão para usar este comando.');
    }

    const channel = message.mentions.channels.first() || message.channel;

    try {
      await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        SendMessages: false,
      });

      logModerationAction(message.guild.id, message.author.id, 'Lock', channel.id, 'Canal bloqueado');

      const embed = new EmbedBuilder()
        .setTitle('<:emoji_48:1322515129144705045> Canal Bloqueado')
        .setDescription(`O canal ${channel} foi bloqueado para envio de mensagens.`)
        .setColor('Red')
        .setFooter({
          text: `${message.author.username}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      message.reply('<:no:1122370713932795997> Ocorreu um erro ao bloquear o canal.');
    }
  },
};