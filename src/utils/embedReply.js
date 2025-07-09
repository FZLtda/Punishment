'use strict';

const { EmbedBuilder } = require('discord.js');
const { emojis, colors } = require('@config');

// Cores fixas padrão
const COLORS = {
  yellow: colors.yellow,
  red: colors.red,
  green: colors.green
};

/**
 * Envia uma embed padronizada no canal da mensagem.
 * @param {'yellow'|'red'|'green'} type - Tipo de embed (cor).
 * @param {import('discord.js').Message} message - Mensagem original.
 * @param {string} content - Texto a ser exibido.
 * @returns {Promise<void>}
 */
async function sendEmbed(type, message, content) {
  const color = COLORS[type] || COLORS.yellow;

  const embed = new EmbedBuilder()
    .setColor(color)
    .setAuthor({
      name: content,
      iconURL: emojis.attentionIcon
    });

  return message.channel.send({
    embeds: [embed],
    allowedMentions: { repliedUser: false }
  });
}

module.exports = { sendEmbed };
