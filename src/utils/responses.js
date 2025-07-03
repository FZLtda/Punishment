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
    .setAuthor({ name: texto, iconURL: emojis.attention });

  try {
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ embeds: [embed], ephemeral: true });
    } else {
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  } catch (_) { /* silencioso */ }
}

module.exports = { sendInteractionError };
