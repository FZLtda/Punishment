"use strict";

const { EmbedBuilder } = require("discord.js");
const { colors, emojis } = require("@config");

function createKickEmbed(message, membro, motivo) {
  return new EmbedBuilder()
    .setTitle(`${emojis.kick} Punição aplicada`)
    .setColor(colors.red)
    .setDescription(`${membro} (\`${membro.id}\`) foi expulso(a) do servidor.`)
    .addFields({
      name: "Motivo",
      value: `\`${motivo}\``
    })
    .setThumbnail(membro.user.displayAvatarURL({ dynamic: true }))
    .setFooter({
      text: message.author.username,
      iconURL: message.author.displayAvatarURL({ dynamic: true })
    })
    .setTimestamp();
}

module.exports = { createKickEmbed };
