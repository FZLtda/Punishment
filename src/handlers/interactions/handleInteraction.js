'use strict';

const Logger = require('@logger');
const { sendInteractionError } = require('@helpers/responses');

/**
 * Manipula todos os tipos de interação do Discord
 * @param {import('discord.js').Interaction} interaction
 * @param {import('discord.js').Client} client
 * @returns {Promise<boolean>} Retorna se foi tratado ou não
 */
module.exports = async function handleInteraction(interaction, client) {
  const typeHandlers = {
    ChatInputCommand: handleSlash,
    Button: handleButton,
    StringSelectMenu: handleMenu,
    UserSelectMenu: handleMenu,
    RoleSelectMenu: handleMenu,
    ModalSubmit: handleModal,
    Autocomplete: handleAutocomplete,
    MessageCommand: handleContextMenu,
    UserCommand: handleContextMenu
  };

  for (const [key, handler] of Object.entries(typeHandlers)) {
    if (typeof interaction[`is${key}`] === 'function' && interaction[`is${key}`]()) {
      return handler(interaction, client);
    }
  }

  return false;
};

// Função auxiliar para log padrão
function logInteraction(type, interaction, extra = '') {
  const user = `${interaction.user?.tag} (${interaction.user?.id})`;
  const guild = interaction.guild?.name || 'DM';
  const label = interaction.customId || `/${interaction.commandName}`;
  Logger.info(`[${type.toUpperCase()}] ${label} executado por ${user} em ${guild}${extra}`);
}

async function handleSlash(interaction, client) {
  const command = client.slashCommands.get(interaction.commandName);
  if (!command) {
    Logger.warn(`[SLASH] Comando não encontrado: ${interaction.commandName}`);
    return sendInteractionError(interaction, 'Comando não encontrado.');
  }

  await command.execute(interaction, client);
  logInteraction('slash', interaction);
  return true;
}

async function handleButton(interaction, client) {
  const button = client.buttons.get(interaction.customId);
  if (!button) {
    Logger.warn(`[BUTTON] Não reconhecido: ${interaction.customId}`);
    return sendInteractionError(interaction, 'Botão não reconhecido.');
  }

  await button.execute(interaction, client);
  logInteraction('button', interaction);
  return true;
}

async function handleMenu(interaction, client) {
  const menu = client.menus.get(interaction.customId);
  if (!menu) {
    Logger.warn(`[MENU] Não reconhecido: ${interaction.customId}`);
    return sendInteractionError(interaction, 'Menu não reconhecido.');
  }

  await menu.execute(interaction, client);
  logInteraction('menu', interaction);
  return true;
}

async function handleModal(interaction, client) {
  const modal = client.modals.get(interaction.customId);
  if (!modal) {
    Logger.warn(`[MODAL] Não reconhecido: ${interaction.customId}`);
    return sendInteractionError(interaction, 'Modal não reconhecido.');
  }

  await modal.execute(interaction, client);
  logInteraction('modal', interaction);
  return true;
}

async function handleAutocomplete(interaction, client) {
  const command = client.slashCommands.get(interaction.commandName);
  if (!command?.autocomplete) return false;

  await command.autocomplete(interaction, client);
  Logger.debug(`[AUTOCOMPLETE] Processado: ${interaction.commandName}`);
  return true;
}

async function handleContextMenu(interaction, client) {
  const command = client.contextMenus.get(interaction.commandName);
  if (!command) {
    Logger.warn(`[CONTEXT] Comando de contexto não encontrado: ${interaction.commandName}`);
    return sendInteractionError(interaction, 'Comando de contexto não encontrado.');
  }

  await command.execute(interaction, client);
  logInteraction('context', interaction);
  return true;
}
