'use strict';

const { EmbedBuilder } = require('discord.js');
const GlobalBan = require('@models/GlobalBan');
const { colors, emojis } = require('@config');
const { isOnCooldown } = require('@utils/globalBanCache');

/**
 * Verifica se o usuário está banido globalmente e envia a mensagem adequada.
 * Suporta interações e mensagens.
 * 
 * @param {import('discord.js').Message | import('discord.js').Interaction} context
 * @returns {Promise<boolean>}
 */
module.exports = async function checkGlobalBan(context) {
  const user = context.user || context.author;
  if (!user || user.bot) return false;

  const ban = await GlobalBan.findOne({ userId: user.id });
  if (!ban) return false;

  if (isOnCooldown(user.id)) return true;

  const embed = new EmbedBuilder()
    .setColor(colors.yellow)
    .setTitle(`${emojis.attentionEmoji} Global Ban Notification`)
    .setDescription([
      'You have been **permanently banned** from using the bot system due to a violation of our terms of service.',
      'You are no longer able to use any commands or access features provided by this bot.',
      '',
      `If you believe this was a mistake, please contact: **contato@funczero.xyz**`
    ].join('\n'))
    .setFooter({
      text: user.username,
      iconURL: user.displayAvatarURL({ dynamic: true })
    })
    .setTimestamp();

  try {
    if (typeof context.reply === 'function') {
      await context.reply({
        embeds: [embed],
        allowedMentions: { repliedUser: false },
        flags: 1 << 6
      });
    } else if (context.channel?.send) {
      await context.channel.send({
        embeds: [embed],
        allowedMentions: { repliedUser: false }
      });
    }
  } catch {
  
  }

  return true;
};
