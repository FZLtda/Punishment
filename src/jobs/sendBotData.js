'use strict';

const { api } = require('../services/apiClient');
const Logger = require('@logger');

async function sendBotData(client) {
  try {
    const totalUsers = client.guilds.cache.reduce(
      (total, guild) => total + guild.memberCount,
      0
    );

    const guildsData = client.guilds.cache.map(guild => ({
      id: guild.id,
      name: guild.name,
      icon: guild.icon,
      members: guild.memberCount
    }));

    // Status
    await api.post('/bot/status', {
      online: true
    });

    // Guilds
    await api.post('/bot/guilds', {
      guilds: guildsData
    });

    // Users
    await api.post('/bot/users', {
      total: totalUsers
    });

    Logger.debug('[API] Dados enviados com sucesso.');
  } catch (err) {
    Logger.error('[API] Erro ao enviar dados:', err.message);
  }
}

module.exports = { sendBotData };
