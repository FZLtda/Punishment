'use strict';

const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  customId: 'embed_set_description',

  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId('modal_embed_description')
      .setTitle('📄 Definir Descrição da Embed');

    const campo = new TextInputBuilder()
      .setCustomId('input_embed_description')
      .setLabel('Digite a descrição da embed')
      .setPlaceholder('Exemplo: Este é um aviso importante para todos.')
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(4096)
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(campo));

    await interaction.showModal(modal);
  }
};
