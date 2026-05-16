"use strict";

const { 
  ModalBuilder, 
  TextInputBuilder, 
  TextInputStyle, 
  ActionRowBuilder 
} = require("discord.js");

module.exports = {
  customId: "openSuggestionModal",

  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId("suggestModal")
      .setTitle("Nova Sugestão");

    const descInput = new TextInputBuilder()
      .setCustomId("suggestDescription")
      .setLabel("Descreva sua sugestão")
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder("Explique sua ideia detalhadamente...")
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(descInput)
    );

    await interaction.showModal(modal);
  },
};
