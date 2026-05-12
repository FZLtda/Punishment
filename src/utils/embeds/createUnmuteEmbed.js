"use strict";

const { EmbedBuilder } = require("discord.js");
const { colors, emojis } = require("@config");

/**
 * @param {import('discord.js').User} moderator
 * @param {import('discord.js').GuildMember} target
 * @param {string} reason
 */
function createUnmuteEmbed(moderator, target, reason) {
  return new EmbedBuilder()
    .setTitle(`${emojis.unmute} Punição removida`)
    .setColor(colors.green)
    .setDescription(`${target} (\`${target.id}\`) teve o mute removido com sucesso.`)
    .addFields({ name: "Motivo", value: `\`${reason}\`` })
    .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
    .setFooter({
      text: moderator.username,
      iconURL: moderator.displayAvatarURL({ dynamic: true }),
    })
    .setTimestamp();
}

module.exports = { createUnmuteEmbed };

