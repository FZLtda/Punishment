'use strict';

const { setBotPresence } = require('@bot/presence');
const Logger = require('@logger');

module.exports = {
  name: 'ready',
  once: true,

  /**
   * Evento disparado quando o bot está pronto
   * @param {import('discord.js').Client} client
   */
  async execute(client) {
    try {
      await setBotPresence(client);
      Logger.info('Presença configurada com sucesso.');
    } catch (error) {
      Logger.fatal(`Erro durante a configuração de presença: ${error.stack || error.message}`);
    }
  }
};
