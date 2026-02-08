const { api } = require('../services/apiClient');
const Logger = require('@logger');

async function sendBotStatus(client) {
  try {
    await api.post('/bot/status', {
      guilds: client.guilds.cache.size,
      users: client.users.cache.reduce((a, g) => a + g.memberCount, 0),
      uptime: process.uptime(),
      memoryMB: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
      ping: client.ws.ping,
      node: process.version
    });

    Logger.debug('[API] Status enviado com sucesso.');
  } catch (err) {
    Logger.error('[API] Erro ao enviar status:', err.message);
  }
}

module.exports = { sendBotStatus };
