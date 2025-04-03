const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function generateButtons(page, totalPages, uniqueId) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`${uniqueId}-first`)
      .setLabel('⏮️')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(page === 1),
    new ButtonBuilder()
      .setCustomId(`${uniqueId}-previous`)
      .setLabel('◀️')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(page === 1),
    new ButtonBuilder()
      .setCustomId(`${uniqueId}-next`)
      .setLabel('▶️')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(page === totalPages),
    new ButtonBuilder()
      .setCustomId(`${uniqueId}-last`)
      .setLabel('⏭️')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(page === totalPages)
  );
}

module.exports = { generateButtons };