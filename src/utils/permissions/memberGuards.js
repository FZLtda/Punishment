'use strict';

const { sendWarning } = require('@utils/embedWarning');

/**
 * Verifica se uma ação de moderação pode ser executada em um membro.
 * Realiza verificações de existência, identidade, permissões e hierarquia.
 *
 * @param {import('discord.js').Message} message - Mensagem de origem da ação.
 * @param {import('discord.js').GuildMember | null} target - Membro alvo da ação.
 * @param {'ban' | 'kick' | 'mute' | 'unmute' | 'role' | 'warn'} action - Tipo da ação a ser validada.
 * @returns {Promise<boolean>} Retorna `true` se todas as verificações forem aprovadas, ou `false` com mensagem explicativa.
 */

async function checkMemberGuard(message, target, action = 'ban') {
  const { guild, author, member, client } = message;
  const botMember = guild.members.me;

  if (!target)
    return sendBlock(message, 'Mencione um usuário válido para continuar.');

  if (target.id === author.id)
    return sendBlock(message, 'Você não pode executar essa ação em si mesmo.');

  if (target.id === client.user.id)
    return sendBlock(message, 'Não posso executar essa ação em mim mesmo.');

  if (target.id === guild.ownerId)
    return sendBlock(message, 'Você não pode executar essa ação no dono do servidor.');

  if (target.user?.bot)
    return sendBlock(message, 'Esta ação não pode ser usada contra bots.');

  if (member.roles.highest.comparePositionTo(target.roles.highest) <= 0 && author.id !== guild.ownerId)
    return sendBlock(message, 'Você não pode executar essa ação em um membro com cargo igual ou superior ao seu.');

  if (botMember.roles.highest.comparePositionTo(target.roles.highest) <= 0)
    return sendBlock(message, 'Não consigo executar essa ação devido à minha posição de cargo inferior.');

  const actionChecks = {
    ban: () => target.bannable,
    kick: () => target.kickable,
    mute: () => target.moderatable,
    unmute: () => target.moderatable,
    role: () => true,
    warn: () => true
  };

  const canAct = actionChecks[action]?.();
  if (canAct === false)
    return sendBlock(message, `Não posso executar a ação \`${action}\` neste usuário. Verifique permissões ou hierarquia.`);

  return true;
}

/**
 * Envia uma mensagem padronizada de erro ao canal e retorna false.
 * 
 * @param {import('discord.js').Message} message - Mensagem de origem.
 * @param {string} content - Texto da mensagem de erro.
 * @returns {Promise<boolean>} Sempre retorna `false`.
 */
async function sendBlock(message, content) {
  await sendWarning(message, content);
  return false;
}

module.exports = { checkMemberGuard };
