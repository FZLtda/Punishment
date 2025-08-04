const { EmbedBuilder } = require('discord.js');
const { emojis, colors } = require('@config');

/**
 * Responde a interações com uma embed de erro
 * @param {import('discord.js').Interaction} interaction
 * @param {string} texto
 */
async function sendInteractionError(interaction, texto) {
  const embed = new EmbedBuilder()
    .setColor(colors.yellow)
    .setAuthor({ name: texto, iconURL: emojis.attentionIcon });

  try {
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ embeds: [embed], flags: 1 << 6 });
    } else {
      await interaction.reply({ embeds: [embed], flags: 1 << 6 });
    }
  } catch (_) { /* silencioso */ }
}

module.exports = { sendInteractionError };
