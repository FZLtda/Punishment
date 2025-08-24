'use strict';

const { InteractionType, EmbedBuilder } = require('discord.js');
const Logger = require('@logger');
const handleInteraction = require('@interactions/handleInteraction');
const { sendInteractionError } = require('@helpers/responses');
const checkGlobalBan = require('@middlewares/checkGlobalBan');
const { emojis, colors } = require('@config');

module.exports = {
  name: 'interactionCreate',
  once: false,

  /**
   * Manipulador central de interações do Discord
   * @param {import('discord.js').Interaction} interaction
   * @param {import('discord.js').Client} client
   */
  async execute(interaction, client) {
    const interactionLabel = getInteractionLabel(interaction);

    try {
      // Global Ban
      if (await checkGlobalBan(interaction)) return;
      
      const handled = await handleInteraction(interaction, client);

      if (!handled) {
        Logger.warn(`[INTERACTION] Não tratado: ${interactionLabel}`);
        await sendInteractionError(interaction, 'Essa interação não pôde ser processada.');
      }

    } catch (err) {
      Logger.error(`[INTERACTION] Erro em ${interactionLabel}: ${err.stack || err.message}`);
      await sendInteractionError(interaction, 'Não foi possível processar sua interação.');
    }
  }
};

/**
 * Retorna uma string identificadora da interação (para logs)
 * @param {import('discord.js').Interaction} interaction
 * @returns {string}
 */
function getInteractionLabel(interaction) {
  if (interaction.isChatInputCommand()) return `SLASH /${interaction.commandName}`;
  if (interaction.isButton()) return `BUTTON ${interaction.customId}`;
  if (interaction.isStringSelectMenu?.()) return `SELECT_MENU/STRING ${interaction.customId}`;
  if (interaction.isUserSelectMenu?.()) return `SELECT_MENU/USER ${interaction.customId}`;
  if (interaction.isRoleSelectMenu?.()) return `SELECT_MENU/ROLE ${interaction.customId}`;
  if (interaction.type === InteractionType.ModalSubmit) return `MODAL ${interaction.customId}`;
  if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
    return `AUTOCOMPLETE /${interaction.commandName}`;
  }

  return `UNKNOWN (${interaction.type})`;
}
