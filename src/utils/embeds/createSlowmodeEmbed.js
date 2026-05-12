"use strict";

const { EmbedBuilder } = require("discord.js");
const { colors, emojis } = require("@config");

/**
 * @param {import('discord.js').User} moderator
 * @param {string} tempo
 * @param {number} segundos
 * @param {string} reason
 */
function createSlowmodeEmbed(moderator, tempo, segundos, reason) {
  return new EmbedBuilder()
    .setColor(segundos === 0 ? colors.green : 0xFE3838)
    .setTitle(`${emojis?.slow} Modo Lento Atualizado`)
    .setDescription(
      segundos === 0
        ? "O tempo entre mensagens neste canal foi **desativado** com sucesso."
        : `O tempo entre mensagens neste canal foi definido para \`${tempo}\`.`
    )
    .addFields({ name: "Motivo", value: reason })
    .setFooter({
      text: moderator.username,
      iconURL: moderator.displayAvatarURL({ dynamic: true }),
    })
    .setTimestamp();
}

module.exports = { createSlowmodeEmbed };

