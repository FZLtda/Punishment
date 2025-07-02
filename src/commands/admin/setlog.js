'use strict';

const { EmbedBuilder, ChannelType } = require('discord.js');
const GuildSettings = require('@models/GuildSettings');
const { colors, emojis } = require('@config');

module.exports = {
  name: 'setlog',
  description: 'Define o canal de log de moderação.',
  usage: '${currentPrefix}setlog <#canal>',
  category: 'Administração',
  userPermissions: ['Administrator'],
  botPermissions: ['ManageChannels'],
  deleteMessage: true,

  async execute(message, args) {
    const canal = message.mentions.channels.first();
    
    if (!canal) return sendError(message, 'Mencione um canal válido.');
    if (canal.type !== ChannelType.GuildText)
      return sendError(message, 'O canal precisa ser de texto.');

    try {
      await GuildSettings.findOneAndUpdate(
        { guildId: message.guild.id },
        { logChannelId: canal.id },
        { upsert: true, new: true }
      );

      const embed = new EmbedBuilder()
        .setColor(colors.green)
        .setDescription(`${emojis.success} Canal de log definido para ${canal}.`)
        .setFooter({
          text: 'Punishment • Configuração de Log',
          iconURL: message.client.user.displayAvatarURL()
        })
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });

    } catch (error) {
      console.error(error);
      return sendError(message, 'Não foi possível salvar a configuração.');
    }
  }
};

function sendError(message, texto) {
  const embed = new EmbedBuilder()
    .setColor(colors.yellow)
    .setAuthor({ name: texto, iconURL: emojis.attention });

  return message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
}
