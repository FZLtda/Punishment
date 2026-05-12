"use strict";

const { EmbedBuilder } = require("discord.js");
const { colors, emojis } = require("@config");

/**
 * @param {import('discord.js').User} moderator
 * @param {import('discord.js').GuildMember} target
 * @param {string} reason
 */
function createUserUnlockEmbed(moderator, target, reason) {
  return new EmbedBuilder()
    .setTitle(`${emojis.unlock} Punição removida`)
    .setColor(colors.green)
    .setDescription(`${target} (\`${target.id}\`) pode novamente enviar mensagens neste canal.`)
    .addFields({ name: "Motivo", value: `\`${reason}\``, inline: true })
    .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
    .setFooter({
      text: moderator.username,
      iconURL: moderator.displayAvatarURL({ dynamic: true }),
    })
    .setTimestamp();
}

module.exports = { createUserUnlockEmbed };

