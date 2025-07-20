'use strict';

/**
 * Executado uma única vez quando o Punishment está pronto.
 * Aqui são feitas as configurações iniciais essenciais:
 * 
 * - Define a presença do bot
 * - Inicia tarefas programadas (como sorteios)
 * - Emite um sinal indicando que está online
 * 
 * Erros são registrados e tratados para garantir estabilidade.
 * 
 * @file src/events/ready.js
 * @event Client#ready
 */

const { setBotPresence } = require('@coreBot/presence');
const Logger = require('@logger');
const monitor = require('@core/monitor');
const iniciarSorteiosTask = require('@tasks/sorteios');

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
      monitor.emit('ready', client.user.tag);
    } catch (err) {
      Logger.fatal(`Falha ao iniciar evento 'ready': ${err.stack || err.message}`);
      monitor.emit('error', 'event:ready', err);
    }
  }
};
