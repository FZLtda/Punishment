"use strict";

const { EmbedBuilder } = require("discord.js");
const { colors, emojis } = require("@config");

/**
 * @param {import('discord.js').User} moderator
 * @param {string} motivo
 */
function createUnlockEmbed(moderator, motivo) {
  const reason = motivo?.trim() || "Não especificado.";

  return new EmbedBuilder()
    .setTitle(`${emojis.unlock} Canal desbloqueado`)
    .setColor(colors.green)
    .setDescription("Este canal foi desbloqueado com sucesso.")
    .addFields({
      name: "Motivo",
      value: `\`${reason}\``,
      inline: true
    })
    .setFooter({
      text: moderator.username,
      iconURL: moderator.displayAvatarURL({ dynamic: true })
    })
    .setTimestamp();
}

module.exports = { createUnlockEmbed };

