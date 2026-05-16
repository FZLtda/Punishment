"use strict";

const Logger = require("@logger");

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
    const checker = interaction[`is${key}`];
    if (typeof checker === "function" && checker.call(interaction)) {
      try {
        return await handler(interaction, client);
      } catch (err) {
        Logger.error(`[${key.toUpperCase()}] Erro ao executar handler:`, err);
        return true;
      }
    }
  }

  return false;
};

function logInteraction(type, interaction, extra = "") {
  const user = `${interaction.user?.tag ?? "Unknown"} (${interaction.user?.id ?? "Unknown"})`;
  const guild = interaction.guild?.name ?? "DM";
  const label = interaction.customId ?? (interaction.commandName ? `/${interaction.commandName}` : "unknown");
  Logger.info(`[${type.toUpperCase()}] ${label} executado por ${user} em ${guild}${extra}`);
}

async function handleSlash(interaction, client) {
  const command = client.slashCommands.get(interaction.commandName);
  if (!command) {
    Logger.warn(`[SLASH] Comando não encontrado: ${interaction.commandName}`);
    return true;
  }

  await safeExecute(command.execute, interaction, client, "SLASH");
  logInteraction("slash", interaction);
  return true;
}

async function handleButton(interaction, client) {
  const button = client.buttons.get(interaction.customId);
  if (!button) {
    Logger.warn(`[BUTTON] Não reconhecido: ${interaction.customId}`);
    return true;
  }

  await safeExecute(button.execute, interaction, client, "BUTTON");
  logInteraction("button", interaction);
  return true;
}

async function handleMenu(interaction, client) {
  const menu = client.menus.get(interaction.customId);
  if (!menu) {
    Logger.warn(`[MENU] Não reconhecido: ${interaction.customId}`);
    return true;
  }

  await safeExecute(menu.execute, interaction, client, "MENU");
  logInteraction("menu", interaction);
  return true;
}

async function handleModal(interaction, client) {
  const modal = client.modals.get(interaction.customId);
  if (!modal) {
    Logger.warn(`[MODAL] Não reconhecido: ${interaction.customId}`);
    return true;
  }

  await safeExecute(modal.execute, interaction, client, "MODAL");
  logInteraction("modal", interaction);
  return true;
}

async function handleAutocomplete(interaction, client) {
  const command = client.slashCommands.get(interaction.commandName);
  if (!command?.autocomplete) return false;

  await safeExecute(command.autocomplete, interaction, client, "AUTOCOMPLETE");
  Logger.debug(`[AUTOCOMPLETE] Processado: ${interaction.commandName}`);
  return true;
}

async function handleContextMenu(interaction, client) {
  const command = client.contextMenus.get(interaction.commandName);
  if (!command) {
    Logger.warn(`[CONTEXT] Comando de contexto não encontrado: ${interaction.commandName}`);
    return true;
  }

  await safeExecute(command.execute, interaction, client, "CONTEXT");
  logInteraction("context", interaction);
  return true;
}

async function safeExecute(fn, interaction, client, type) {
  if (typeof fn !== "function") {
    Logger.warn(`[${type}] Handler inválido ou ausente para ${interaction.customId ?? interaction.commandName ?? "unknown"}`);
    return;
  }

  try {
    await fn(interaction, client);
  } catch (err) {
    Logger.error(`[${type}] Erro na execução:`, err);
  }
}
