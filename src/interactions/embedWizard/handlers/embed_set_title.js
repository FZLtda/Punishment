'use strict';

const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  customId: 'embed_set_title',

  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId('modal_embed_title')
      .setTitle('🖋️ Definir Título da Embed');

    const campo = new TextInputBuilder()
      .setCustomId('input_embed_title')
      .setLabel('Digite o título da embed')
      .setPlaceholder('Exemplo: Aviso importante')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setMaxLength(256);

    const row = new ActionRowBuilder().addComponents(campo);
    modal.addComponents(row);

    await interaction.showModal(modal);
  }
};
