"use strict";

const { ApplicationCommandType } = require("discord.js");
const ModerationService = require("@services/ModerationService");

module.exports = {
  name: "Denunciar Mensagem",
  type: ApplicationCommandType.Message,
  description: "Denuncia a mensagem selecionada para a moderação.",
  userPermissions: [],
  botPermissions: ["SendMessages"],
  deleteMessage: true,

  /**
   * @param {import("discord.js").MessageContextMenuCommandInteraction} interaction 
   */
  async execute(interaction) {
    const mensagemDenunciada = interaction.targetMessage;
    const targetUser = mensagemDenunciada.author;
    const denunciante = interaction.user;

    if (targetUser.id === denunciante.id) {
      return interaction.reply({ 
        content: "Você não pode denunciar a sua própria mensagem.", 
        ephemeral: true 
      });
    }

    if (targetUser.bot) {
      return interaction.reply({ 
        content: "Você não pode denunciar mensagens de bots.", 
        ephemeral: true 
      });
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      await ModerationService.createReport({
        reporter: denunciante,
        target: targetUser,
        reportedMessage: mensagemDenunciada,
        reason: "Denúncia enviada via Menu de Contexto (Apps).",
        channel: interaction.channel,
        guild: interaction.guild
      });

      await interaction.editReply({ 
        content: `✅ A mensagem de **${targetUser.tag}** foi denunciada com sucesso aos administradores.` 
      });

    } catch (error) {
      console.error("[Context Command: Denunciar] Falha:", error);
      await interaction.editReply({ 
        content: "Não foi possível enviar a denúncia devido a um erro interno. Tente contatar a equipe diretamente." 
      });
    }
  }
};
