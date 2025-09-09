'use strict';

const { setBotPresence } = require('@core/presence');
const Logger = require('@logger');

module.exports = {
  name: 'shardReady',
  once: false,

  /**
   * Executado quando uma shard inicia do zero.
   * @param {number} id ID da shard
   * @param {import('discord.js').Client} client
   */
  async execute(id, client) {
    try {
      await setBotPresence(client);
      Logger.info(`Shard ${id} inicializada, presença aplicada.`);
    } catch (err) {
      Logger.error(`Erro ao aplicar presença na shard ${id}: ${err.message}`);
    }
  }
};
