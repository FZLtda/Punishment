'use strict';

const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  customId: 'suggestion_make',

  /**
   * Executa o botão de sugestão
   * @param {import('discord.js').ButtonInteraction} interaction
   * @param {import('discord.js').Client} client
   */
  async execute(interaction, client) {
    const modal = new ModalBuilder()
      .setCustomId('suggestion_modal')
      .setTitle('Nova Sugestão');

    const input = new TextInputBuilder()
      .setCustomId('suggestion_text')
      .setLabel('Qual é a sua sugestão?')
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(1000)
      .setPlaceholder('Escreva sua ideia aqui...')
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(input));

    return interaction.showModal(modal);
  }
};
