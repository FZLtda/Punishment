'use strict';

const { setBotPresence } = require('@core/presence');
const Logger = require('@logger');
const monitor = require('@core/monitor');
const iniciarSorteiosTask = require('@tasks/sorteios');
const iniciarAtribuicaoDeDoadores = require('@tasks/atribuirDoadoresPendentes');
const { sendBotData } = require('@jobs/botStatusJob');

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

      // Envia status imediatamente
      await sendBotData(client);

      // Atualiza a cada 1 minuto
      if (!client.statusInterval) {
        client.statusInterval = setInterval(() => {
          sendBotData(client);
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
