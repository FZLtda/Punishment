const cache = new Map();

/**
 * Inicia a sessão para um usuário
 */
function sessionStart(userId) {
  if (!cache.has(userId)) {
    cache.set(userId, {
      embed: {},
      step: 'start'
    });
  }
  return cache.get(userId);
}

function getSession(userId) {
  return cache.get(userId);
}

function updateSession(userId, data) {
  const session = cache.get(userId);
  if (session) {
    cache.set(userId, { ...session, ...data });
  }
}

function resetSession(userId) {
  cache.delete(userId);
}

module.exports = {
  sessionStart,
  getSession,
  updateSession,
  resetSession
};
