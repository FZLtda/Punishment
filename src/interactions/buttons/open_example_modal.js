'use strict';

const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder
} = require('discord.js');

module.exports = {
  customId: 'open_example_modal',

  /**
   * Executa o botão que abre o modal de feedback
   * @param {import('discord.js').ButtonInteraction} interaction
   * @param {import('discord.js').Client} client
   */
  async execute(interaction, client) {
    const modal = new ModalBuilder()
      .setCustomId('example_modal')
      .setTitle('Formulário de Feedback');

    const nameInput = new TextInputBuilder()
      .setCustomId('name_input')
      .setLabel('Seu nome')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const feedbackInput = new TextInputBuilder()
      .setCustomId('feedback_input')
      .setLabel('Escreva seu feedback')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(nameInput),
      new ActionRowBuilder().addComponents(feedbackInput)
    );

    await interaction.showModal(modal);
  }
};
