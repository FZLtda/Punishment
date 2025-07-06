'use strict';

const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  customId: 'embed_set_color',

  async execute(interaction) {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('color_red')
        .setLabel('🔴 Vermelho')
        .setStyle(ButtonStyle.Danger),

      new ButtonBuilder()
        .setCustomId('color_blue')
        .setLabel('🔵 Azul')
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId('color_green')
        .setLabel('🟢 Verde')
        .setStyle(ButtonStyle.Success)
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('color_default')
        .setLabel('⚪ Padrão')
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId('embed_preview')
        .setLabel('👁️ Preview Atual')
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId('embed_cancel')
        .setLabel('❌ Cancelar')
        .setStyle(ButtonStyle.Danger)
    );

    await interaction.reply({
      content: '🧱 Escolha a cor da embed:',
      components: [row, row2],
      ephemeral: true
    });
  }
};
