'use strict';

const { sendError } = require('@utils/embedError');

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

  await sendError(message, 'Eu não tenho permissão suficiente para executar este comando.');
  return false;
};
