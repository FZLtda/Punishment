'use strict';

const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  customId: 'openSuggestionModal',

  /**
   * Executa o botão de abrir modal de sugestão.
   * @param {import('discord.js').ButtonInteraction} interaction
   * @param {import('discord.js').Client} client
   */
  async execute(interaction, client) {
    const modal = new ModalBuilder()
      .setCustomId('suggestModal')
      .setTitle('Nova Sugestão');

    const titleInput = new TextInputBuilder()
      .setCustomId('suggestTitle')
      .setLabel('Título da sugestão')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Ex: Melhorar sistema de logs')
      .setRequired(true);

    const descInput = new TextInputBuilder()
      .setCustomId('suggestDescription')
      .setLabel('Descreva sua sugestão')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Explique sua ideia detalhadamente...')
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(titleInput),
      new ActionRowBuilder().addComponents(descInput)
    );

    await interaction.showModal(modal);
  },
};
