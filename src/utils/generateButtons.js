const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function generateButtons(page, totalPages) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('first')
      .setLabel('⏮️')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(page === 1),
    new ButtonBuilder()
      .setCustomId('previous')
      .setLabel('◀️')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(page === 1),
    new ButtonBuilder()
      .setCustomId('next')
      .setLabel('▶️')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(page === totalPages),
    new ButtonBuilder()
      .setCustomId('last')
      .setLabel('⏭️')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(page === totalPages)
  );
}

module.exports = { generateButtons };