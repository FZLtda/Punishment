'use strict';

const cooldown = new Map();

/**
 * Define ou verifica cooldown para um usuário banido.
 * @param {string} userId - ID do usuário
 * @param {number} delay - Tempo em ms (padrão 30s)
 * @returns {boolean} - True se o usuário ainda estiver em cooldown.
 */
function isOnCooldown(userId, delay = 30_000) {
  const now = Date.now();
  const lastAttempt = cooldown.get(userId);

  if (lastAttempt && now - lastAttempt < delay) return true;

  cooldown.set(userId, now);
  return false;
}

module.exports = { isOnCooldown };
