'use strict';

const { setBotPresence } = require('@core/presence');
const Logger = require('@logger');
const monitor = require('@core/monitor');
const iniciarSorteiosTask = require('@tasks/sorteios');
const iniciarAtribuicaoDeDoadores = require('@tasks/atribuirDoadoresPendentes');

module.exports = {
  name: 'ready',
  once: true,

  /**
   * Executa ações de inicialização após o bot estar pronto.
   * @param {import('discord.js').Client} client
   */
  async execute(client) {
    Logger.info(`[Ready] Inicializando com usuário: ${client.user?.tag || 'desconhecido'}`);

    if (!client.isReady()) {
      Logger.warn('[Ready] Client não está marcado como pronto. Aguardando próximo ciclo...');
      return;
    }

    try {
      await setBotPresence(client, 'ready');

      await Promise.allSettled([
        iniciarSorteiosTask(client),
        iniciarAtribuicaoDeDoadores(client)
      ]);

      monitor.emit('ready', client.user.tag);
      Logger.info('[Ready] Inicialização concluída com sucesso.');
    } catch (err) {
      Logger.fatal(`[Ready] Falha durante inicialização: ${err.stack || err.message}`);
      monitor.emit('error', 'event:ready', err);
    }
  }
};
