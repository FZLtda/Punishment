"use strict";

const { sendWarning } = require("@embeds");
const { checkMemberGuard } = require("@permissions/memberGuards");
const ChannelUserLockService = require("@services/ChannelUserLockService");

module.exports = {
  name: "lockuser",
  description: "Impede que um usuário envie mensagens no canal atual.",
  usage: "${currentPrefix}lockuser <@usuário> [motivo]",
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
      await ChannelUserLockService.lock({
        guild: message.guild,
        channel: message.channel,
        moderator: message.author,
        target,
        reason: motivo
      });
    } catch (error) {
      console.error(`[Command: lockuser] Erro ao bloquear usuário ${target?.id}:`, error);
      await sendWarning(message, "Ocorreu um erro ao tentar bloquear o usuário neste canal.");
    }
  },
};
