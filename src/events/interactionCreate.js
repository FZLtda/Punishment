const { handleSlashCommand } = require('../handlers/slashCommandHandler');
const { handleButtonInteraction } = require('../handlers/buttonInteractionHandler');
const { checkTerms, handleTermsInteraction } = require('../handlers/termsHandler');
const logger = require('../utils/logger');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    try {
      
      if (!await checkTerms(interaction)) return;

      if (interaction.isChatInputCommand()) {
        return await handleSlashCommand(interaction, client);
      }

      if (interaction.isButton()) {
        if (interaction.customId === 'accept_terms' || interaction.customId === 'decline_terms') {
          return await handleTermsInteraction(interaction);
        }

        return await handleButtonInteraction(interaction, client);
      }
    } catch (error) {
      logger.error(`ERRO: Erro no evento interactionCreate: ${error.message}`, { stack: error.stack });
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: '<:Erro:1356016602994180266> Não foi possível processar essa ação.',
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: '<:Erro:1356016602994180266> Não foi possível processar essa ação.',
          ephemeral: true,
        });
      }
    }
  },
};




