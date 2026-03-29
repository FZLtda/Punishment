"use strict";

const { EmbedBuilder } = require("discord.js");
const { colors, emojis } = require("@config");

/**
 * @param {import('discord.js').User} moderator - O usuário que aplicou o mute.
 * @param {import('discord.js').GuildMember} membro - O membro silenciado.
 * @param {string} tempo - Tempo formatado.
 * @param {string} motivo - Motivo da punição.
 */
function createMuteEmbed(moderator, membro, tempo, motivo) {
  return new EmbedBuilder()
    .setTitle(`${emojis.mute} Punição aplicada`)
    .setColor(colors.red)
    .setDescription(`${membro} (\`${membro.id}\`) foi silenciado(a).`)
    .addFields(
      { name: "Duração", value: tempo, inline: true },
      { name: "Motivo", value: `\`${motivo}\``, inline: true }
    )
    .setThumbnail(membro.user.displayAvatarURL({ forceStatic: false }))
    .setFooter({
      text: `${moderator.username}`,
      iconURL: moderator.displayAvatarURL({ forceStatic: false }),
    })
    .setTimestamp();
}

module.exports = { createMuteEmbed };
