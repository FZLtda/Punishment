'use strict';

const { EmbedBuilder } = require('discord.js');
const { colors, emojis } = require('@config');

/**
 * Verifica se o autor possui as permissões necessárias.
 * @param {import('discord.js').GuildMember} member
 * @param {import('discord.js').Message} message
 * @param {string[]} requiredPermissions
 * @returns {Promise<boolean>}
 */
module.exports = async function checkUserPermissions(member, message, requiredPermissions = []) {
  if (!member?.permissions) return false;

  const missing = requiredPermissions.filter(p => !member.permissions.has(p));
  if (missing.length === 0) return true;

  const embed = new EmbedBuilder()
    .setColor(colors.red)
    .setAuthor({
      name: 'Você não tem permissão para executar esse comando.',
      iconURL: emojis.errorIcon
    });

  await message.channel.send({
    embeds: [embed],
    allowedMentions: { repliedUser: false }
  });

  return false;
};
