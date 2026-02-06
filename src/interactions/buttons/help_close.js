'use strict';

const Logger = require('@logger');

module.exports = {
  customId: 'help_close',

  /**
   * Fecha o menu de ajuda (slash e prefixo)
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async execute(interaction) {
    try {
      await interaction.deferUpdate();

      if (interaction.message?.flags?.has(1 << 6)) {
        await interaction.deleteReply();
      } else {
        await interaction.message.delete();
      }

      Logger.info(
        `[HELP] Menu de ajuda fechado por ${interaction.user.tag} (${interaction.user.id})`
      );
    } catch (err) {
      Logger.warn(
        `[HELP] Falha ao fechar menu de ajuda: ${err.message}`
      );
    }
  },
};
