"use strict";

const { ApplicationCommandType } = require("discord.js");
const ModerationService = require("@services/ModerationService");

module.exports = {
  name: "Denunciar Mensagem",
  type: ApplicationCommandType.Message,

  /**
   * @param {import("discord.js").MessageContextMenuCommandInteraction} interaction 
   */
  async execute(interaction) {
    const message = interaction.targetMessage;
    const author = message.author;

    if (author.id === interaction.user.id) {
      return interaction.reply({
        content: "Você não pode denunciar sua própria mensagem.",
        ephemeral: true
      });
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      await ModerationService.createReport({
        reporter: interaction.user,
        target: author,
        message: message,
        reason: "Reportado via Context Menu",
        guild: interaction.guild
      });

      await interaction.editReply({
        content: "✅ A mensagem foi enviada para análise da equipe de moderação."
      });
    } catch (error) {
      await interaction.editReply({
        content: "Ocorreu um erro ao processar a denúncia."
      });
    }
  }
};
