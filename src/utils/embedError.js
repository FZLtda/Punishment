'use strict';

const { EmbedBuilder } = require('discord.js');
const { colors, emojis } = require('@config');

/**
 * Envia uma embed de erro padronizada.
 * @param {import('discord.js').Message} message - Mensagem original.
 * @param {string} content - Texto a ser exibido.
 */
async function sendError(message, content) {
  const embed = new EmbedBuilder()
    .setColor(colors.red)
    .setAuthor({
      name: content,
      iconURL: emojis.errorIcon
    });

  return message.channel.send({
    embeds: [embed],
    allowedMentions: { repliedUser: false }
  });
}

module.exports = { sendError };
