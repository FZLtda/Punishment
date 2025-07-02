'use strict';

const { setBotPresence } = require('@bot/presence');
const Logger = require('@logger');
const monitor = require('@core/monitor');
const iniciarSorteiosTask = require('@tasks/sorteios');

/**
 * Evento executado uma única vez quando o bot está totalmente pronto.
 * @type {import('discord.js').ClientEvents}
 */
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
      Logger.info(`Presença definida com sucesso para ${client.user.tag}.`);

      iniciarSorteiosTask(client);
      monitor.emit('ready', client.user.tag);
    } catch (err) {
      Logger.fatal(`Falha ao configurar presença: ${err.stack || err.message}`);
      monitor.emit('error', 'event:ready', err);
    }
  }
};
