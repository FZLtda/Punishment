'use strict';

const { setBotPresence } = require('@bot/presence');
const Logger = require('@logger');
const monitor = require('@core/monitor');

/**
 * Evento disparado quando o bot está totalmente pronto
 * @type {import('discord.js').ClientEvents}
 */
module.exports = {
  name: 'ready',
  once: true,

  async execute(client) {
    try {
      await setBotPresence(client);
      Logger.info('Presença configurada com sucesso.');

      global.client = client;
      monitor.emit('ready', client.user.tag);

    } catch (error) {
      Logger.fatal(`Erro durante a configuração de presença: ${error.stack || error.message}`);
      monitor.emit('error', 'event:ready', error);
    }
  }
};
