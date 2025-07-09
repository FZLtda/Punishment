'use strict';

const { sendEmbed } = require('@utils/embedReply');

/**
 * Verifica se uma ação de moderação pode ser executada em um membro.
 * @param {import('discord.js').Message} message - Mensagem original.
 * @param {import('discord.js').GuildMember | null} target - Membro alvo.
 * @param {'ban' | 'kick' | 'mute' | 'unmute' | 'role' | 'warn'} action - Ação sendo executada.
 * @returns {Promise<boolean>} - `false` se bloqueado, `true` se liberado.
 */
async function checkMemberGuard(message, target, action = 'ban') {
  const { guild, author, member } = message;

  if (!target) {
    await sendEmbed('yellow', message, 'Mencione um usuário válido para continuar.');
    return false;
  }

  if (target.id === author.id) {
    await sendEmbed('yellow', message, 'Você não pode executar essa ação em si mesmo.');
    return false;
  }

  if (target.id === guild.ownerId) {
    await sendEmbed('yellow', message, 'Você não pode executar essa ação no dono do servidor.');
    return false;
  }

  if (target.id === message.client.user.id) {
    await sendEmbed('yellow', message, 'Não posso executar essa ação em mim mesmo.');
    return false;
  }

  // Hierarquia: autor não pode agir sobre alguém com cargo maior ou igual
  if (member.roles.highest.comparePositionTo(target.roles.highest) <= 0 && author.id !== guild.ownerId) {
    await sendEmbed('yellow', message, 'Você não pode executar essa ação em um membro com cargo igual ou superior ao seu.');
    return false;
  }

  // Hierarquia: bot também precisa ter cargo mais alto
  const botMember = guild.members.me;
  if (botMember.roles.highest.comparePositionTo(target.roles.highest) <= 0) {
    await sendEmbed('yellow', message, 'Não consigo executar essa ação devido à minha posição de cargo.');
    return false;
  }

  // Permissões específicas por ação
  switch (action) {
    case 'ban':
      if (!target.bannable) {
        await sendEmbed('yellow', message, 'Este usuário não pode ser banido.');
        return false;
      }
      break;
    case 'kick':
      if (!target.kickable) {
        await sendEmbed('yellow', message, 'Este usuário não pode ser expulso.');
        return false;
      }
      break;
    case 'mute':
    case 'unmute':
      if (!target.moderatable) {
        await sendEmbed('yellow', message, 'Este usuário não pode ser silenciado.');
        return false;
      }
      break;
    // Add outras ações conforme necessário
  }

  return true;
}

module.exports = { checkMemberGuard };
