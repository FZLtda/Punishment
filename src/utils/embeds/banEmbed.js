"use strict";

const { EmbedBuilder } = require("discord.js");
const { colors, emojis } = require("@config");

function createBanEmbed(message, targetUser, motivo) {
  return new EmbedBuilder()
    .setTitle(`${emojis.ban} Punição aplicada`)
    .setColor(colors.red)
    .setDescription(`${targetUser} (\`${targetUser.id}\`) foi banido permanentemente.`)
    .addFields({
      name: "Motivo",
      value: `\`${motivo}\``
    })
    .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
    .setFooter({
      text: message.author.username,
      iconURL: message.author.displayAvatarURL({ dynamic: true })
    })
    .setTimestamp();
}

module.exports = { createBanEmbed };
