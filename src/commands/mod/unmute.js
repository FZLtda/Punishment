"use strict";

const { sendWarning } = require("@embeds");
const { checkMemberGuard } = require("@permissions");
const { ChannelUnmuteService } = require("@services");

module.exports = {
  name: "unmute",
  description: "Remove o mute (timeout) de um membro.",
  usage: "${currentPrefix}unmute <@usuário> [motivo]",
  category: "Moderação",
  userPermissions: ["ModerateMembers"],
  botPermissions: ["ModerateMembers"],
  deleteMessage: true,

  async execute(message, args) {
    const membro = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    const motivo = args.slice(1).join(" ") || "Não especificado.";

    if (!membro) {
      return sendWarning(message, "Você deve mencionar um usuário válido.");
    }

    const isValid = await checkMemberGuard(message, membro, "unmute");
    if (!isValid) return;

    if (!membro.communicationDisabledUntilTimestamp) {
      return sendWarning(message, "Este usuário não está silenciado no momento.");
    }

    try {
      await ChannelUnmuteService.unmute({
        guild: message.guild,
        channel: message.channel,
        moderator: message.author,
        target: membro,
        reason: motivo,
      });
    } catch (error) {
      console.error(`[Command: unmute] Erro ao remover mute do usuário ${membro?.id}:`, error);
      await sendWarning(message, "Não foi possível remover o mute do usuário devido a um erro inesperado.");
    }
  },
};
