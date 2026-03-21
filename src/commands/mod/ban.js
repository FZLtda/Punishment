"use strict";

const { EmbedBuilder } = require("discord.js");
const { colors, emojis } = require("@config");
const { sendModLog } = require("@modules/modlog");
const { sendWarning } = require("@embeds/embedWarning");
const { checkMemberGuard } = require("@permissions/memberGuards");

module.exports = {
  name: "ban",
  description: "Bane permanentemente um membro do servidor.",
  userPermissions: ["BanMembers"],
  botPermissions: ["BanMembers"],
  deleteMessage: true,

  async execute(message, args) {
    const targetId = message.mentions.users.first()?.id || args[0];
    if (!targetId) {
      return sendWarning(message, "Você precisa mencionar um usuário ou fornecer um ID válido.");
    }

    const motivo = args.slice(1).join(" ") || "Não especificado.";

    let targetUser;
    try {
      targetUser = await message.client.users.fetch(targetId);
    } catch {
      return sendWarning(message, "Usuário não encontrado. Verifique se o ID fornecido está correto.");
    }

    const memberInGuild = message.guild.members.cache.get(targetUser.id) || await message.guild.members.fetch(targetUser.id).catch(() => null);

    if (memberInGuild) {
      const isValid = await checkMemberGuard(message, memberInGuild, "ban");
      if (!isValid) return; 
    }

    try {
      await message.guild.members.ban(targetUser.id, { reason: motivo });

      const embed = new EmbedBuilder()
        .setTitle(`${emojis.ban} Punição aplicada`)
        .setColor(colors.red)
        .setDescription(`${targetUser} (\`${targetUser.id}\`) foi banido permanentemente.`)
        .addFields({ name: "Motivo", value: `\`${motivo}\`` })
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
        .setFooter({
          text: `${message.author.username}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });

      await sendModLog(message.guild, {
        action: "Ban",
        target: targetUser,
        moderator: message.author,
        reason: motivo
      });

    } catch (error) {
      console.error("[BAN_CMD_ERROR]", error);
      return sendWarning(message, "Não foi possível banir o usuário devido a um erro inesperado.");
    }
  }
};
