'use strict';

const { EmbedBuilder } = require('discord.js');
const { colors, emojis } = require('@config');

/**
 * Envia uma embed de sucesso padronizada.
 * @param {import('discord.js').Message} message - Mensagem original.
 * @param {string} content - Texto a ser exibido.
 */
async function sendSuccess(message, content) {
  const embed = new EmbedBuilder()
    .setColor(colors.green)
    .setAuthor({
      name: content,
      iconURL: emojis.successIcon
    });

  return message.channel.send({
    embeds: [embed],
    allowedMentions: { repliedUser: false }
  });
}

module.exports = { sendSuccess };
