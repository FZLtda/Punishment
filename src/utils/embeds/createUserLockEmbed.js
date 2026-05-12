"use strict";

const { EmbedBuilder } = require("discord.js");
const { colors, emojis } = require("@config");

/**
 * @param {import('discord.js').User} moderator
 * @param {import('discord.js').GuildMember} target
 * @param {string} reason
 */
function createUserLockEmbed(moderator, target, reason) {
  return new EmbedBuilder()
    .setTitle(`${emojis.lock} Punição aplicada`)
    .setColor(colors.red)
    .setDescription(`${target} (\`${target.id}\`) não poderá mais enviar mensagens neste canal.`)
    .addFields({ name: "Motivo", value: `\`${reason}\``, inline: true })
    .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
    .setFooter({
      text: moderator.username,
      iconURL: moderator.displayAvatarURL({ dynamic: true }),
    })
    .setTimestamp();
}

module.exports = { createUserLockEmbed };
