'use strict';

const Logger = require('@logger');

module.exports = {
  name: 'shardDisconnect',
  once: false,

  /**
   * Loga quando a shard é desconectada.
   * @param {CloseEvent} event Evento de desconexão
   * @param {number} id ID da shard
   */
  async execute(event, id) {
    Logger.warn(
      `[Shard ${id}] Desconectada. Código: ${event.code}, Motivo: ${event.reason || 'desconhecido'} (event:shardDisconnect)`
    );
  }
};
