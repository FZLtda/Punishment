'use strict';

const Punishment = require('@models/Punishment');
const Logger = require('@logger');

/**
 * Serviço responsável por operações de punições
 */
module.exports = {
  /**
   * Retorna o histórico de punições de um usuário em um servidor
   * @param {string} guildId
   * @param {string} userId
   */
  async getPunishmentsByUser(guildId, userId) {
    const context = `[PUNISHMENT_SERVICE][${guildId}]`;

    if (!guildId || !userId) {
      throw new Error('guildId e userId são obrigatórios');
    }

    try {
      return await Punishment
        .find({ guildId, userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

    } catch (error) {
      Logger.error(
        `${context} Erro ao buscar punições: ${error.stack || error.message}`
      );
      throw error;
    }
  }
};
