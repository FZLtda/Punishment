"use strict";

const { EmbedBuilder } = require("discord.js");
const { colors, emojis } = require("@config");

function createUnbanEmbed(message, user, userId, motivo) {
  return new EmbedBuilder()
    .setTitle(`${emojis.unban} Banimento removido`)
    .setColor(colors.green)
    .setDescription(`${user.tag} (\`${userId}\`) teve o banimento removido com sucesso.`)
    .addFields({
      name: "Motivo",
      value: `\`${motivo}\``
    })
    .setThumbnail(user.displayAvatarURL({ dynamic: true }))
    .setFooter({
      text: message.author.username,
      iconURL: message.author.displayAvatarURL({ dynamic: true })
    })
    .setTimestamp();
}

module.exports = { createUnbanEmbed };
