'use strict';

const { EmbedBuilder } = require('discord.js');
const { colors, emojis } = require('@config');

/**
 * Verifica se o bot possui as permissões necessárias.
 * @param {import('discord.js').GuildMember} botMember
 * @param {import('discord.js').Message} message
 * @param {string[]} requiredPermissions
 * @returns {Promise<boolean>}
 */
module.exports = async function checkBotPermissions(botMember, message, requiredPermissions = []) {
  if (!botMember?.permissions) return false;

  const missing = requiredPermissions.filter(p => !botMember.permissions.has(p));
  if (missing.length === 0) return true;

  const embed = new EmbedBuilder()
    .setColor(colors.red)
    .setAuthor({
      name: 'Eu não tenho permissão suficiente para executar este comando.',
      iconURL: emojis.errorIcon
    });

  await message.channel.send({
    embeds: [embed],
    allowedMentions: { repliedUser: false }
  });

  return false;
};
