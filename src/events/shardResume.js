'use strict';

const { setBotPresence } = require('@core/presence');
const Logger = require('@logger');

module.exports = {
  name: 'shardResume',
  once: false,

  async execute(id, client) {
    try {
      await setBotPresence(client);
      Logger.info(`Shard ${id} reconectada, presença reaplicada.`);
    } catch (err) {
      Logger.error(`Erro ao reaplicar presença na shard ${id}: ${err.message}`);
    }
  }
};
