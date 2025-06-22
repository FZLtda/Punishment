'use strict';

const logger = require('@utils/logger');
const { emojis } = require('@config');
const { checkTerms } = require('@handleButton/termsButtons');
const routeInteraction = require('@interactions/router');

module.exports = {
  name: 'interactionCreate',
  /**
   * @param {import('discord.js').Interaction} interaction
   * @param {import('discord.js').Client} client
   */
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
        const accepted = await checkTerms(interaction);
        if (!accepted) return;
      }

      await routeInteraction(interaction, client, type);
    } catch (error) {
      logger.error(`ERRO: interactionCreate - ${error.message}\nStack: ${error.stack}`);

      const errorMessage = {
        content: `${emojis.attent} Não foi possível processar essa ação.`,
        ephemeral: true,
      };

      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(errorMessage).catch(() => {});
        } else {
          await interaction.reply(errorMessage).catch(() => {});
        }
      } catch (replyError) {
        logger.error(`Falha ao enviar resposta de erro: ${replyError.message}`);
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
