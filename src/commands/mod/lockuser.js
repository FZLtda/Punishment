"use strict";

const { sendWarning } = require("@embeds");
const { checkMemberGuard } = require("@permissions/memberGuards");
const ChannelUserLockService = require("@services/ChannelUserLockService");

module.exports = {
  name: "lockuser",
  description: "Impede que um usuário envie mensagens no canal atual.",
  usage: "${currentPrefix}lockuser <@usuário>",
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
      await ChannelUserLockService.lock({
        guild: message.guild,
        channel: message.channel,
        moderator: message.author,
        target
      });
    } catch (error) {
      console.error(`[Command: lockuser] Erro ao bloquear usuário ${target?.id}:`, error);
      await sendWarning(message, "Ocorreu um erro ao tentar bloquear o usuário neste canal.");
    }
  },
};
