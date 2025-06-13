const { EmbedBuilder } = require('discord.js');
const { logModerationAction } = require('../utils/moderationUtils');
const { yellow } = require('../config/colors.json');
const { icon_attention } = require('../config/emoji.json');

module.exports = {
  name: 'lock',
  description: 'Bloqueia o envio de mensagens em um canal.',
  usage: '${currentPrefix}lock [canal]',
  userPermissions: ['ManageChannels'],
  botPermissions: ['ManageChannels'],
  deleteMessage: true,
  
  async execute(message) {

    const channel = message.mentions.channels.first() || message.channel;

    try {
      await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        SendMessages: false,
      });

      logModerationAction(message.guild.id, message.author.id, 'Lock', channel.id, 'Canal bloqueado');

      const embed = new EmbedBuilder()
        .setTitle('<:Bloqueado:1355700508660076554> Canal Bloqueado')
        .setDescription(`O canal ${channel} foi bloqueado para envio de mensagens.`)
        .setColor(red)
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
          name: 'Não foi possível bloquear o canal devido a um erro.',
          iconURL: icon_attention
        });

      return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
    }
  },
};
