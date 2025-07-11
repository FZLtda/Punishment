'use strict';

const { EmbedBuilder } = require('discord.js');
const GlobalBan = require('@models/GlobalBan');
const { colors, emojis } = require('@config');
const { isOnCooldown } = require('@utils/globalBanCache');

module.exports = async function checkGlobalBan(message) {
  if (!message || !message.author || message.author.bot) return false;

  const ban = await GlobalBan.findOne({ userId: message.author.id });
  if (!ban) return false;

  if (isOnCooldown(message.author.id)) return true;

  const embed = new EmbedBuilder()
    .setColor(colors.yellow)
    .setTitle(`${emojis.attentionEmoji} Global Ban`)
    .setDescription(
      `You have been permanently banned from using the bot system due to a violation of our terms of service.\n\n` +
      `**Reason:** ${ban.reason}\n\n` +
      `You can no longer use commands or access any features provided by this bot.\n\n` +
      `If you believe this was a mistake, contact: contato@funczero.xyz`
    )
    .setFooter({
      text: message.author.username,
      iconURL: message.author.displayAvatarURL({ dynamic: true })
    })
    .setTimestamp();

  await message.channel.send({ embeds: [embed] }).catch(() => {});
  return true;
};
