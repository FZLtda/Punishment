'use strict';

const ModerationAction = require('@models/ModerationAction');
const Logger = require('@logger');

module.exports = {
  async getPunishmentsByUser(guildId, userId) {
    const context = `[MODERATION_ACTION][${guildId}]`;

    if (!guildId || !userId) {
      throw new Error('guildId e userId são obrigatórios');
    }

    try {
      return await ModerationAction
        .find({ guildId, targetId: userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();
    } catch (error) {
      Logger.error(
        `${context} Erro ao buscar histórico: ${error.stack || error.message}`
      );
      throw error;
    }
  }
};
