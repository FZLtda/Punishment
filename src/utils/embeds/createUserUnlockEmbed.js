"use strict";

const { EmbedBuilder } = require("discord.js");
const { colors, emojis } = require("@config");

/**
 * @param {import('discord.js').User} moderator
 * @param {import('discord.js').GuildMember} target
 */
function createUserUnlockEmbed(moderator, target) {
  return new EmbedBuilder()
    .setTitle(`${emojis.unlock} Punição removida`)
    .setColor(colors.green)
    .setDescription(
      `${target} (\`${target.id}\`) pode novamente enviar mensagens neste canal.`
    )
    .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
    .setFooter({
      text: moderator.username,
      iconURL: moderator.displayAvatarURL({ dynamic: true }),
    })
    .setTimestamp();
}

module.exports = { createUserUnlockEmbed };

