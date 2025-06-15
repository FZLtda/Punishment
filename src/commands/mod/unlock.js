const { EmbedBuilder } = require('discord.js');
const { logModerationAction } = require('../../utils/moderationUtils');
const { yellow, green } = require('../../config/colors.json');
const { icon_attention } = require('../../config/emoji.json');

module.exports = {
  name: 'unlock',
  description: 'Desbloqueia o envio de mensagens em um canal.',
  usage: '${currentPrefix}unlock [canal]',
  userPermissions: ['ManageChannels'],
  botPermissions: ['ManageChannels'],
  deleteMessage: true,
  
  async execute(message) {

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
        .setTitle('<:Desbloqueado:1355700557465125064> Canal Desbloqueado')
        .setDescription(`O canal ${channel} foi desbloqueado para envio de mensagens.`)
        .setColor(green)
        .setFooter({
          text: `${message.author.username}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      const embedErroMinimo = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({
          name: 'Não foi possível desbloquear o canal devido a um erro.',
          iconURL: icon_attention
        });

      return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
    }
  },
};
