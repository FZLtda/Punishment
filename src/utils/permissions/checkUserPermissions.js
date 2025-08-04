'use strict';

const { sendError } = require('@embeds/embedError');

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

  await sendError(message, 'Você não tem permissão para executar esse comando.');
  return false;
};
