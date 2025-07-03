'use strict';

const { EmbedBuilder } = require('discord.js');
const Logger = require('@logger');
const { emojis, colors } = require('@config');

module.exports = {
  name: 'interactionCreate',
  once: false,

  /**
   * Manipulador central de interações (slash, botão, modal, select...)
   * @param {import('discord.js').Interaction} interaction
   * @param {import('discord.js').Client} client
   */
  async execute(interaction, client) {
    try {
      // Slash Commands
      if (interaction.isChatInputCommand()) {
        const command = client.slashCommands.get(interaction.commandName);

        if (!command) {
          Logger.warn(`[INTERACTION] Slash command não encontrado: ${interaction.commandName}`);
          return sendInteractionError(interaction, 'Comando não encontrado.');
        }

        await command.execute(interaction, client);
        Logger.info(`[INTERACTION] Slash command executado: /${interaction.commandName}`);
      }

      // Botões
      else if (interaction.isButton()) {
        const button = client.buttons.get(interaction.customId);

        if (!button) {
          Logger.warn(`[INTERACTION] Botão não reconhecido: ${interaction.customId}`);
          return sendInteractionError(interaction, 'Botão não reconhecido.');
        }

        await button.execute(interaction, client);
        Logger.info(`[INTERACTION] Botão executado: ${interaction.customId}`);
      }

      // Menus seletivos (select menus)
      else if (interaction.isStringSelectMenu() || interaction.isUserSelectMenu() || interaction.isRoleSelectMenu()) {
        const menu = client.menus.get(interaction.customId);

        if (!menu) {
          Logger.warn(`[INTERACTION] Menu não reconhecido: ${interaction.customId}`);
          return sendInteractionError(interaction, 'Menu não reconhecido.');
        }

        await menu.execute(interaction, client);
        Logger.info(`[INTERACTION] Menu executado: ${interaction.customId}`);
      }

      // Modals
      else if (interaction.isModalSubmit()) {
        const modal = client.modals.get(interaction.customId);

        if (!modal) {
          Logger.warn(`[INTERACTION] Modal não reconhecido: ${interaction.customId}`);
          return sendInteractionError(interaction, 'Modal não reconhecido.');
        }

        await modal.execute(interaction, client);
        Logger.info(`[INTERACTION] Modal executado: ${interaction.customId}`);
      }

      // Autocomplete
      else if (interaction.isAutocomplete()) {
        const command = client.slashCommands.get(interaction.commandName);
        if (command?.autocomplete) {
          await command.autocomplete(interaction, client);
          Logger.debug(`[INTERACTION] Autocomplete processado para: ${interaction.commandName}`);
        }
      }

      // Tipo de interação não tratado
      else {
        Logger.warn(`[INTERACTION] Tipo de interação não suportado: ${interaction.type}`);
      }

    } catch (err) {
      Logger.error(`[INTERACTION] Erro ao executar interação: ${err.stack || err.message}`);
      await sendInteractionError(interaction, 'Não foi possível processar sua interação.');
    }
  }
};

/**
 * Envia uma mensagem de erro personalizada como embed com author
 * @param {import('discord.js').Interaction} interaction
 * @param {string} texto
 */
async function sendInteractionError(interaction, texto) {
  const embed = new EmbedBuilder()
    .setColor(colors.yellow)
    .setAuthor({ name: texto, iconURL: emojis.attention });

  if (interaction.replied || interaction.deferred) {
    await interaction.followUp({ embeds: [embed], ephemeral: true }).catch(() => {});
  } else {
    await interaction.reply({ embeds: [embed], ephemeral: true }).catch(() => {});
  }
}
