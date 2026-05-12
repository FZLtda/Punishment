"use strict";

const { 
  sendWarning, 
  createKickEmbed,
} = require("@embeds");

const { sendModLog } = require("@modules/modlog");

const { 
  checkMemberGuard,
} = require("@permissions/memberGuards");

module.exports = {
  name: "kick",
  description: "Expulsa um membro do servidor.",
  usage: "${currentPrefix}kick <@usuário> [motivo]",
  category: "Moderação",
  userPermissions: ["KickMembers"],
  botPermissions: ["KickMembers"],
  deleteMessage: true,

  async execute(message, args) {
    const membro = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

    const isValid = await checkMemberGuard(message, membro, "kick");
    if (!isValid) return;

    const motivo = args.slice(1).join(" ") || "Não especificado.";

    try {
      await membro.kick(motivo);

      const embed = createKickEmbed(message, membro, motivo);
      await message.channel.send({ embeds: [embed] });

      await sendModLog(message.guild, {
        action: "Kick",
        target: membro.user,
        moderator: message.author,
        reason: motivo
      });

    } catch (error) {
      console.error("[kick] Erro ao expulsar membro:", error);
      return sendWarning(message,"Não foi possível expulsar o usuário devido a um erro inesperado.");
    }
  }
};
