'use strict';

const { EmbedBuilder } = require('discord.js');
const GlobalBan = require('@models/GlobalBan');
const { colors, emojis } = require('@config');
const { isOnCooldown } = require('@utils/globalBanCache');

/**
 * Verifica se o usuário está banido globalmente e envia a mensagem adequada.
 * Funciona com Message e Interaction.
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
    .setTitle(`${emojis.attentionEmoji} Global Ban`)
    .setDescription(
      `You have been permanently banned from using the bot system due to a violation of our terms of service.\n\n` +
      `You can no longer use commands or access any features provided by this bot.\n\n` +
      `If you believe this was a mistake, contact: contato@funczero.xyz`
    )
    .setFooter({
      text: user.username,
      iconURL: user.displayAvatarURL({ dynamic: true })
    })
    .setTimestamp();

  if (context.reply) {
    await context.reply({ embeds: [embed], ephemeral: true }).catch(() => {});
  } else if (context.channel?.send) {
    await context.channel.send({ embeds: [embed] }).catch(() => {});
  }

  return true;
};
