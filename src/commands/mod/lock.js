"use strict";

const { 
  sendWarning 
} = require("@embeds");
const { 
  checkChannelLock 
} = require("@permissions/channelGuards");
const ChannelLockService = require("@services");

module.exports = {
  name: "lock",
  description: "Bloqueia o canal atual para que os membros não possam enviar mensagens.",
  usage: "${currentPrefix}lock [motivo]",
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
    const motivo = args.join(" ") || "Não especificado.";

    if (!canal.isTextBased()) {
      return sendWarning(message, "Este comando só pode ser usado em canais de texto.");
    }

    try {
      const isLocked = await checkChannelLock(canal);

      if (isLocked) {
        return sendWarning(message, "Este canal já está bloqueado.");
      }

      await ChannelLockService.lock({
        guild: message.guild,
        channel: canal,
        moderator: message.author,
        reason: motivo
      });

    } catch (error) {
      console.error(`[Command: lock] Falha ao bloquear canal ${canal.id}:`, error);

      return sendWarning(
        message,
        "Não foi possível bloquear o canal devido a um erro inesperado."
      );
    }
  }
};
