'use strict';

const { setBotPresence } = require('@coreBot/presence');
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
    global.client = client;

    try {
      await setBotPresence(client);
      iniciarSorteiosTask(client);
      iniciarAtribuicaoDeDoadores(client);
      monitor.emit('ready', client.user.tag);
    } catch (err) {
      Logger.fatal(`Falha ao iniciar evento 'ready': ${err.stack || err.message}`);
      monitor.emit('error', 'event:ready', err);
    }
  }
};
