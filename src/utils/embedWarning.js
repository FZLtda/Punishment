'use strict';

const { EmbedBuilder } = require('discord.js');
const { colors, emojis } = require('@config');

/**
 * Envia uma embed de aviso padronizada (amarelo).
 * @param {import('discord.js').Message} message - Mensagem original.
 * @param {string} content - Texto a ser exibido.
 */
async function sendWarning(message, content) {
  const embed = new EmbedBuilder()
    .setColor(colors.yellow)
    .setAuthor({
      name: content,
      iconURL: emojis.attentionIcon
    });

  return message.channel.send({
    embeds: [embed],
    allowedMentions: { repliedUser: false }
  });
}

module.exports = { sendWarning };
