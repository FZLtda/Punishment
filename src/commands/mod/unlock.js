"use strict";

const { sendWarning } = require("@embeds");
const { checkChannelLock } = require("@permissions/channelGuards");
const ChannelUnLockService = require("@services/ChannelUnLockService");

module.exports = {
  name: "unlock",
  description: "Desbloqueia o canal atual para que os membros possam enviar mensagens.",
  usage: "${currentPrefix}unlock [motivo]",
  category: "Moderação",
  userPermissions: ["ManageChannels"],
  botPermissions: ["ManageChannels"],
  deleteMessage: true,

  /**
   * @param {import('discord.js').Message} message
   * @param {string[]} args
   */
  async execute(message, args) {
    const canal = message.channel;
    const motivo = args.join(" ")?.trim() || "Não especificado.";

    if (!canal.isTextBased()) {
      return sendWarning(message, "Este comando só pode ser usado em canais de texto.");
    }

    try {
      const isLocked = await checkChannelLock(canal);

      if (!isLocked) {
        return sendWarning(message, "Este canal já está desbloqueado.");
      }

      await ChannelUnLockService({
        guild: message.guild,
        channel: canal,
        moderator: message.author,
        reason: motivo
      });

    } catch (error) {
      console.error(`[Command: unlock] Falha ao desbloquear canal ${canal.id}:`, error);

      return sendWarning(
        message,
        "Não foi possível desbloquear o canal devido a um erro inesperado."
      );
    }
  }
};
