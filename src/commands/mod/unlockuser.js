"use strict";

const { sendWarning } = require("@embeds");
const { checkMemberGuard } = require("@permissions");
const { ChannelUserUnlockService } = require("@services");

module.exports = {
  name: "unlockuser",
  description: "Permite que um usuário volte a enviar mensagens no canal atual.",
  usage: "${currentPrefix}unlockuser <@usuário> [motivo]",
  category: "Moderação",
  userPermissions: ["ManageChannels"],
  botPermissions: ["ManageChannels"],
  deleteMessage: true,

  async execute(message, args) {
    const target =
      message.mentions.members.first() ||
      message.guild.members.cache.get(args[0]);

    const motivo = args.slice(1).join(" ")?.trim() || "Não especificado.";

    const isValid = await checkMemberGuard(message, target, "role");
    if (!isValid) return;

    try {
      await ChannelUserUnlockService.unlock({
        guild: message.guild,
        channel: message.channel,
        moderator: message.author,
        target,
        reason: motivo
      });
    } catch (error) {
      console.error(`[Command: unlockuser] Erro ao desbloquear usuário ${target?.id}:`, error);
      await sendWarning(message, "Não foi possível desbloquear o usuário devido a um erro inesperado.");
    }
  },
};

