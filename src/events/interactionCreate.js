const { handleSlashCommand } = require('../handlers/slashCommandHandler');
const { handleButtonInteraction } = require('../handlers/buttonInteractionHandler');
const { checkTerms } = require('../handlers/termsHandler');
const { check, attent } = require('../config/emoji.json');
const logger = require('../utils/logger');
const db = require('../data/database');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    try {
      if (!interaction.isCommand() && !interaction.isButton()) {
        logger.warn(`Interação não suportada: ${interaction.type}`);
        return;
      }

      switch (true) {
        case interaction.isButton():
          if (interaction.customId === 'accept_terms') {
            const userId = interaction.user.id;
            db.prepare('INSERT OR IGNORE INTO terms (user_id) VALUES (?)').run(userId);

            await interaction.update({
              content: `${check} **Termos de Uso** aceitos! O Punishment já está disponível para você.`,
              components: [],
              embeds: [],
            });

            setTimeout(async () => {
              try {
                const message = await interaction.fetchReply();
                if (message.deletable) await message.delete().catch(() => {});
              } catch (err) {
                logger.warn(`Erro ao apagar mensagem de termos: ${err.message}`);
              }
            }, 5000);
            return;
          }

          return await handleButtonInteraction(interaction, client, db);

        case interaction.isChatInputCommand():
          if (!(await checkTerms(interaction))) return;
          return await handleSlashCommand(interaction, client);

        default:
          logger.info('Tipo de interação não processado.');
          return;
      }

    } catch (error) {
      logger.error(`ERRO: Erro no evento interactionCreate: ${error.message}`, { stack: error.stack });

      const errorMessage = {
        content: `${attent} Não foi possível processar essa ação.`,
        ephemeral: true,
      };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorMessage).catch(() => {});
      } else {
        await interaction.reply(errorMessage).catch(() => {});
      }
    }
  },
};
