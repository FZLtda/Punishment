const logger = require('@utils/logger');
const { attent } = require('@config');
const { checkTerms } = require('@handleButton/termsButtons');
const router = require('@interactions/router');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    try {
      const type = getInteractionType(interaction);

      if (!type) {
        logger.warn(`Interação não suportada: ${interaction.type}`);
        return;
      }

      const isButton = interaction.isButton();
      const isAcceptTerms = isButton && interaction.customId === 'accept_terms';

      if (!isAcceptTerms && (type === 'command' || type === 'button')) {
        if (!(await checkTerms(interaction))) return;
      }

      await routeInteraction(interaction, client, type);
    } catch (error) {
      logger.error(`ERRO: interactionCreate - ${error.message}`, { stack: error.stack });

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

function getInteractionType(interaction) {
  if (interaction.isChatInputCommand()) return 'command';
  if (interaction.isButton()) return 'button';
  if (interaction.isModalSubmit()) return 'modal';
  if (interaction.isStringSelectMenu()) return 'select';
  return null;
}
