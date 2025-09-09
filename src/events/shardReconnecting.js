'use strict';

const Logger = require('@logger');

module.exports = {
  name: 'shardReconnecting',
  once: false,

  /**
   * Loga quando a shard inicia processo de reconexão.
   * @param {number} id ID da shard
   */
  async execute(id) {
    Logger.warn(`Shard ${id} tentando reconectar...`);
  }
};
