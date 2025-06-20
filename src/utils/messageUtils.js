const { EmbedBuilder } = require('discord.js');
const { yellow } = require('@config/colors');
const { icon_attention } = require('@config/emoji');

function parseDuration(input) {
  const match = input.match(/^(\d+)([smhd])$/);
  if (!match) return null;

  const value = parseInt(match[1]);
  const unit = match[2];

  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return multipliers[unit] ? value * multipliers[unit] : null;
}

function sendErrorEmbed(message, text) {
  const embed = new EmbedBuilder()
    .setColor(yellow)
    .setAuthor({ name: text, iconURL: icon_attention });

  return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
}

module.exports = { parseDuration, sendErrorEmbed };
