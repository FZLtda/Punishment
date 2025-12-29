'use strict';

const { EmbedBuilder } = require('discord.js');
const GlobalBan = require('@models/GlobalBan');
const { colors, emojis } = require('@config');
const { isOnCooldown } = require('@cache/globalBanCache');

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
    .setTitle(`${emojis.attentionEmoji} Permanent Global Ban`)
    .setDescription([
      'You have been **permanently banned** from this bot for violating our **Terms of Service**.',
      'This decision is **final**, and all access to commands and features has been **permanently revoked**.',
      '',
      'Appeals will only be reviewed if a mistake is suspected.',
      'Contact: **contato@funczero.xyz**'
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
