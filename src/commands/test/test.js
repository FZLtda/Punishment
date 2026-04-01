"use strict";

const { ApplicationCommandType } = require("discord.js");
// Importe seus serviços normalmente
const ModerationService = require("@services/ModerationService");

module.exports = {
  // O 'name' é EXATAMENTE o que vai aparecer escrito lá no menu "Apps"
  name: "Denunciar Mensagem",
  
  // Isso é o que define que o comando vai para o menu de mensagens (Apps)
  type: ApplicationCommandType.Message, 
  
  // Context menus não usam 'description' na API do Discord, mas mantemos para organizar
  description: "Denuncia a mensagem selecionada para a moderação.",
  userPermissions: [], // Qualquer um pode usar

  /**
   * @param {import('discord.js').MessageContextMenuCommandInteraction} interaction 
   */
  async execute(interaction) {
    // 1. O 'targetMessage' pega automaticamente a mensagem que o usuário clicou para abrir o menu "Apps"
    const mensagemDenunciada = interaction.targetMessage;
    const targetUser = mensagemDenunciada.author;
    const denunciante = interaction.user;

    // 2. Validações básicas
    if (targetUser.id === denunciante.id) {
      return interaction.reply({ 
        content: "Você não pode denunciar a sua própria mensagem.", 
        ephemeral: true // ephemeral: true garante que só o usuário veja o erro (sigilo)
      });
    }

    if (targetUser.bot) {
      return interaction.reply({ 
        content: "Você não pode denunciar mensagens de bots.", 
        ephemeral: true 
      });
    }

    // 3. Resposta de carregamento (para a API do Discord não dar timeout)
    await interaction.deferReply({ ephemeral: true });

    try {
      // 4. Envia para o seu Service
      // Como Menus de Contexto não abrem caixa de texto diretamente, 
      // o motivo pode ser padrão ou você pode abrir um Modal (formulário) depois.
      await ModerationService.createReport({
        reporter: denunciante,
        target: targetUser,
        reportedMessage: mensagemDenunciada,
        reason: "Denúncia enviada via Menu de Contexto (Apps).",
        channel: interaction.channel,
        guild: interaction.guild
      });

      // 5. Confirmação de sucesso para quem denunciou
      await interaction.editReply({ 
        content: `✅ A mensagem de **${targetUser.tag}** foi denunciada com sucesso aos administradores.` 
      });

    } catch (error) {
      console.error(`[Context Command: Denunciar] Falha:`, error);
      await interaction.editReply({ 
        content: "Não foi possível enviar a denúncia devido a um erro interno. Tente contatar a equipe diretamente." 
      });
    }
  }
};
