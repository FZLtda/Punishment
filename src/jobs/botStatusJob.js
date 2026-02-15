'use strict';

const { api } = require('../services/apiClient');
const Logger = require('@logger');

async function sendBotStatus(client) {
  try {
    const totalUsers = client.guilds.cache.reduce(
      (total, guild) => total + guild.memberCount,
      0
    );

    const guildsData = client.guilds.cache.map(guild => ({
      id: guild.id,
      name: guild.name,
      icon: guild.icon
    }));

    await api.post('/bot/status', {
      online: true,
      guilds: guildsData,
      users: totalUsers,
      uptime: process.uptime(),
      memoryMB: Number(
        (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)
      ),
      ping: client.ws.ping,
      node: process.version
    });

    Logger.debug('[API] Status enviado com sucesso.');
  } catch (err) {
    Logger.error('[API] Erro ao enviar status:', err.message);
  }
}

module.exports = { sendBotStatus };
