"use strict";

const { EmbedBuilder } = require("discord.js");
const { colors, emojis } = require("@config");

/**
 * @param {import('discord.js').User} moderator
 * @param {string} motivo
 */
function createLockEmbed(moderator, motivo) {
  const reason = motivo?.trim() || "Não especificado.";

  return new EmbedBuilder()
    .setTitle(`${emojis.lock} Canal bloqueado`)
    .setColor(colors.red)
    .setDescription("Este canal está temporariamente bloqueado para novas mensagens.")
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

module.exports = { createLockEmbed };

