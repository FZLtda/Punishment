const { handleSlashCommand } = require('../handlers/slashCommandHandler');
const { handleButtonInteraction } = require('../handlers/buttonInteractionHandler');
const { checkTerms } = require('../handlers/termsHandler');
const logger = require('../utils/logger');
const db = require('../data/database');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    try {
      if (!interaction.isCommand() && !interaction.isButton()) {
        logger.warn('Interação não suportada ou inválida.');
        return;
      }

      if (interaction.isButton()) {
        if (interaction.customId === 'accept_terms') {
          const userId = interaction.user.id;

          db.prepare('INSERT OR IGNORE INTO terms (user_id) VALUES (?)').run(userId);

          await interaction.update({
            content: '<:1000042885:1336044571125354496> Termos de Uso aceitos! O bot já está disponível para você.',
            components: [],
            embeds: [],
          });
          return;
        }

        if (interaction.customId === 'decline_terms') {
          await interaction.update({
            content: 'Você recusou os Termos de Uso. Não poderá usar o bot.',
            components: [],
            embeds: [],
          });
          return;
        }

        return await handleButtonInteraction(interaction, client);
      }

      if (!await checkTerms(interaction)) return;

      if (interaction.isChatInputCommand()) {
        return await handleSlashCommand(interaction, client);
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