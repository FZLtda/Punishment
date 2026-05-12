"use strict";

const { sendWarning } = require("@embeds");
const { checkMemberGuard } = require("@permissions/memberGuards");
const ChannelUserUnlockService = require("@services/ChannelUserUnlockService");

module.exports = {
  name: "unlockuser",
  description: "Permite que um usuário volte a enviar mensagens no canal atual.",
  usage: "${currentPrefix}unlockuser <@usuário>",
  category: "Moderação",
  userPermissions: ["ManageChannels"],
  botPermissions: ["ManageChannels"],
  deleteMessage: true,

  /**
   * @param {import('discord.js').Message} message
   * @param {string[]} args
   */
  async execute(message, args) {
    const target =
      message.mentions.members.first() ||
      message.guild.members.cache.get(args[0]);

    const isValid = await checkMemberGuard(message, target, "role");
    if (!isValid) return;

    try {
      await ChannelUserUnlockService.unlock({
        guild: message.guild,
        channel: message.channel,
        moderator: message.author,
        target
      });
    } catch (error) {
      console.error(`[Command: unlockuser] Erro ao desbloquear usuário ${target?.id}:`, error);
      await sendWarning(message, "Não foi possível desbloquear o usuário devido a um erro inesperado.");
    }
  },
};
