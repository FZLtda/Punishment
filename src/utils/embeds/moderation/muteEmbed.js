'use strict';

const { EmbedBuilder } = require('discord.js');
const { colors, emojis } = require('@config');

function createMuteEmbed(message, membro, tempo, motivo) {
  return new EmbedBuilder()
    .setTitle(`${emojis.mute} Punição aplicada`)
    .setColor(colors.red)
    .setDescription(`${membro} (\`${membro.id}\`) foi silenciado(a).`)
    .addFields(
      { name: 'Duração', value: `\`${tempo}\``, inline: true },
      { name: 'Motivo', value: `\`${motivo}\``, inline: true }
    )
    .setThumbnail(membro.user.displayAvatarURL({ dynamic: true }))
    .setFooter({
      text: message.author.username,
      iconURL: message.author.displayAvatarURL({ dynamic: true }),
    })
    .setTimestamp();
}

module.exports = { createMuteEmbed };
