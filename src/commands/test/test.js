"use strict";

const { sendWarning } = require("@embeds");
// checkMemberGuard geralmente é para quem aplica punição, então foi removido aqui pois qualquer um pode denunciar.
const ModerationService = require("@services/ModerationService");

module.exports = {
  name: "denunciar",
  description: "Denuncia uma mensagem ou membro para os administradores.",
  userPermissions: [], // Array vazio indica que qualquer membro pode usar
  botPermissions: ["SendMessages"],
  deleteMessage: true, // Importante para apagar a mensagem e manter o sigilo da denúncia

  /**
   * @param {import('discord.js').Message} message 
   * @param {string[]} args 
   */
  async execute(message, args) {
    
    let targetUser;
    let mensagemDenunciada = null;
    let motivo = "";

    // 1. Verifica se o usuário usou o comando respondendo a uma mensagem (Contexto)
    if (message.reference && message.reference.messageId) {
      mensagemDenunciada = await message.channel.messages.fetch(message.reference.messageId).catch(() => null);
      if (mensagemDenunciada) {
        targetUser = mensagemDenunciada.author;
        // O motivo será todo o texto digitado após o comando
        motivo = args.join(" ") || "Nenhum motivo fornecido.";
      }
    } else {
      // 2. Se não respondeu, tenta pegar o alvo pela menção ou pelo ID (args[0])
      const targetId = message.mentions.members.first()?.id || args[0];
      if (!targetId) {
        return sendWarning(message, "Por favor, **responda à mensagem** que deseja denunciar ou mencione o membro.");
      }
      
      const membro = await message.guild.members.fetch(targetId).catch(() => null);
      if (!membro) {
        return sendWarning(message, "Membro não encontrado neste servidor.");
      }
      
      targetUser = membro.user;
      // O motivo será o resto da mensagem após a menção/ID
      motivo = args.slice(1).join(" ") || "Nenhum motivo fornecido.";
    }

    // Validações básicas de segurança
    if (targetUser.id === message.author.id) {
      return sendWarning(message, "Você não pode denunciar a si mesmo.");
    }

    if (targetUser.bot) {
      return sendWarning(message, "Você não pode denunciar um bot.");
    }

    try {
      // Enviando os dados para o seu Service cuidar de criar o log/embed no canal de denúncias
      // Certifique-se de que o método 'createReport' exista no seu ModerationService
      await ModerationService.createReport({
        reporter: message.author,
        target: targetUser,
        reportedMessage: mensagemDenunciada,
        reason: motivo,
        channel: message.channel,
        guild: message.guild
      });

      // Feedback privado para o denunciante (já que deleteMessage é true)
      await message.author.send(`✅ Sua denúncia contra **${targetUser.tag}** foi enviada com sucesso aos administradores do servidor **${message.guild.name}**.`).catch(() => null);

    } catch (error) {
      console.error(`[Command: denunciar] Falha ao enviar denúncia de ${message.author.tag}:`, error);
      return sendWarning(message, "Não foi possível enviar a denúncia devido a um erro interno. Tente contatar a equipe diretamente.");
    }
  }
};

