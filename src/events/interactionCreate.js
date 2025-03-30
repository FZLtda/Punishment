const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../data/database');
const logger = require('../utils/logger');
const { handleSlashCommand } = require('../handlers/slashCommandHandler');
const { handleButtonInteraction } = require('../handlers/buttonInteractionHandler');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    try {
      
      if (interaction.isChatInputCommand()) {
        return await handleSlashCommand(interaction, client);
      }

      if (interaction.isButton()) {
        return await handleButtonInteraction(interaction, client, db);
      }
    } catch (error) {
      logger.error(`Erro no evento interactionCreate: ${error.message}`, { stack: error.stack });
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: 'Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.',
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: 'Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.',
          ephemeral: true,
        });
      }
    }
  },
};





