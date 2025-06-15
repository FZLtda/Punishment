const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function createPaginatorRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('prev').setLabel('◀').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('stop').setLabel('⛔').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('next').setLabel('▶').setStyle(ButtonStyle.Secondary)
  );
}

function handlePaginatorInteraction(action, currentIndex, total) {
  switch (action) {
    case 'prev':
      return { index: (currentIndex - 1 + total) % total };
    case 'next':
      return { index: (currentIndex + 1) % total };
    case 'stop':
      return { end: true };
    default:
      return { index: currentIndex };
  }
}

module.exports = { createPaginatorRow, handlePaginatorInteraction };
