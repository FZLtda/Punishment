const { handleSlashCommand } = require('../handlers/slashCommandHandler');
const { handleButtonInteraction } = require('../handlers/buttonInteractionHandler');
const { checkTerms } = require('../handlers/termsHandler');
const automodInteractions = require('../interactions/automod'); // Importa o sistema AutoMod
const { check, error } = require('../config/emoji.json');
const logger = require('../utils/logger');
const db = require('../data/database');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    try {
      if (!interaction.isCommand() && !interaction.isButton()) {
        logger.info('Interação não suportada ou inválida.');
        return;
      }

      if (interaction.isButton()) {

        if (interaction.customId.startsWith('automod_')) {
          return await automodInteractions.handle(interaction);
        }

        if (interaction.customId === 'accept_terms') {
          const userId = interaction.user.id;

          db.prepare('INSERT OR IGNORE INTO terms (user_id) VALUES (?)').run(userId);

          await interaction.update({
            content: `${check} **Termos de Uso** aceitos! O Punishment já está disponível para você.`,
            components: [],
            embeds: [],
          });
          return;
        }

        return await handleButtonInteraction(interaction, client, db);
      }

      if (!await checkTerms(interaction)) return;

      if (interaction.isChatInputCommand()) {
        return await handleSlashCommand(interaction, client);
      }
    } catch (error) {
      logger.error(`ERRO: Erro no evento interactionCreate: ${error.message}`, { stack: error.stack });

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: `${error} Não foi possível processar essa ação.`,
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: `${error} Não foi possível processar essa ação.`,
          ephemeral: true,
        });
      }
    }
  },
};