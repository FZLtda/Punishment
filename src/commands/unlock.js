const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const { logModerationAction } = require('../utils/moderationUtils');

module.exports = {
  name: 'unlock',
  description: 'Desbloqueia o envio de mensagens em um canal.',
  usage: '${currentPrefix}unlock [canal]',
  permissions: 'Gerenciar Canais',
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      const embedErroMinimo = new EmbedBuilder()
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Você não possui permissão para usar este comando.',
          iconURL: 'http://bit.ly/4aIyY9j'
      });

  return message.reply({ embeds: [embedErroMinimo] });
    }

    const channel = message.mentions.channels.first() || message.channel;

    try {
      await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        SendMessages: true,
      });

      logModerationAction(
        message.guild.id,
        message.author.id,
        'Unlock',
        channel.id,
        'Canal desbloqueado para envio de mensagens'
      );

      const embed = new EmbedBuilder()
        .setTitle('<:emoji_49:1322515171578744915> Canal Desbloqueado')
        .setDescription(`O canal ${channel} foi desbloqueado para envio de mensagens.`)
        .setColor('Green')
        .setFooter({
          text: `${message.author.username}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      const embedErroMinimo = new EmbedBuilder()
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Não foi possível desbloquear o canal devido a um erro.',
          iconURL: 'http://bit.ly/4aIyY9j'
      });

  return message.reply({ embeds: [embedErroMinimo] });
    }
  },
};
