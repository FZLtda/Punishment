const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const { logModerationAction } = require('../utils/moderationUtils');

module.exports = {
  name: 'lock',
  description: 'Bloqueia o envio de mensagens em um canal.',
  usage: '${currentPrefix}lock [canal]',
  permissions: 'Gerenciar Canais',
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      const embedErroMinimo = new EmbedBuilder()
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Você não possui permissão para usar este comando.',
          iconURL: 'http://bit.ly/4aIyY9j'
      });

  return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
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
      const embedErroMinimo = new EmbedBuilder()
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Não foi possível bloquear o canal devido a um erro.',
          iconURL: 'http://bit.ly/4aIyY9j'
      });

  return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
    }
  },
};
