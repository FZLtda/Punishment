'use strict';

const { EmbedBuilder } = require('discord.js');
const Logger = require('@logger');
const handleInteraction = require('@interactions/handleInteraction');

const { emojis, colors } = require('@config');

module.exports = {
  name: 'interactionCreate',
  once: false,

  async execute(interaction, client) {
    try {
      const handled = await handleInteraction(interaction, client);

      if (!handled) {
        Logger.warn(`[INTERACTION] Tipo de interação não suportado ou manipulador ausente: ${interaction.type}`);
      }

    } catch (err) {
      Logger.error(`[INTERACTION] Erro ao processar interação: ${err.stack || err.message}`);
      await sendInteractionError(interaction, 'Ocorreu um erro ao processar sua interação.');
    }
  }
};
