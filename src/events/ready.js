'use strict';

const axios = require('axios');
const { setBotPresence } = require('@core/presence');
const Logger = require('@logger');
const monitor = require('@core/monitor');
const iniciarSorteiosTask = require('@tasks/sorteios');
const iniciarAtribuicaoDeDoadores = require('@tasks/atribuirDoadoresPendentes');
const { sendBotData } = require('@jobs/sendBotData');

module.exports = {
  name: 'ready',
  once: true,

  async execute(client) {
    Logger.info(`[Ready] Inicializando com usuário: ${client.user?.tag || 'desconhecido'}`);

    if (!client.isReady()) {
      Logger.warn('[Ready] Client não está marcado como pronto.');
      return;
    }

    try {
      await setBotPresence(client, 'ready');

      await Promise.allSettled([
        iniciarSorteiosTask(client),
        iniciarAtribuicaoDeDoadores(client)
      ]);

      const sendBetterStackHeartbeat = async () => {
        const url = process.env.BETTERSTACK_HEARTBEAT_URL;
        if (!url) {
          Logger.warn('[BetterStack] URL de heartbeat não encontrada no .env');
          return;
        }

        try {
          await axios.get(url);
        } catch (err) {
          Logger.error(`[BetterStack] Falha ao enviar heartbeat: ${err.message}`);
        }
      };

      await sendBotData(client);
      await sendBetterStackHeartbeat();

      if (!client.statusInterval) {
        client.statusInterval = setInterval(async () => {
          await sendBotData(client);
          await sendBetterStackHeartbeat();
        }, 60000);
      }

      monitor.emit('ready', client.user.tag);
      Logger.info('[Ready] Inicialização concluída com sucesso.');

    } catch (err) {
      Logger.fatal(`[Ready] Falha durante inicialização: ${err.stack || err.message}`);
      monitor.emit('error', 'event:ready', err);
    }
  }
};
