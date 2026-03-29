"use strict";

const { sendModLog } = require("@modules/modlog");
const { createUnbanEmbed, sendWarning } = require("@embeds");

module.exports = {
  name: "unban",
  description: "Remove o banimento de um usuário pelo ID.",
  usage: "${currentPrefix}unban <ID do usuário> [motivo]",
  userPermissions: ["BanMembers"],
  botPermissions: ["BanMembers"],
  deleteMessage: true,

  async execute(message, args) {
    const userId = args[0];
    const motivo = args.slice(1).join(" ") || "Não especificado.";

    if (!userId || !/^\d{17,19}$/.test(userId)) {
      return sendWarning(message, "Forneça um ID de usuário válido para remover o banimento.");
    }

    try {
      const banInfo = await message.guild.bans.fetch(userId).catch(() => null);
      if (!banInfo) {
        return sendWarning(message, "Este usuário não está banido ou o ID é inválido.");
      }

      await message.guild.members.unban(userId, motivo);

      const embed = createUnbanEmbed(message, banInfo.user, userId, motivo);
      await message.channel.send({ embeds: [embed] });

      await sendModLog(message.guild, {
        action: "Unban",
        target: banInfo.user,
        moderator: message.author,
        reason: motivo
      });

    } catch (error) {
      console.error(error);
      return sendWarning(message, "Não foi possível remover o banimento do usuário.");
    }
  }
};
