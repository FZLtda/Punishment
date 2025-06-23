'use strict';

const { handleSlashCommand } = require('@handleSlash/slashCommandHandler');
const logger = require('@utils/logger');
const { emojis } = require('@config');

module.exports = async function handleCommand(interaction, client) {
  try {
    await handleSlashCommand(interaction, client);
  } catch (error) {
    logger.error(`Erro ao executar comando ${interaction.commandName}: ${error.message}`, {
      stack: error.stack,
      user: interaction.user.tag,
      userId: interaction.user.id,
      command: interaction.commandName,
    });

    const errorMessage = `${emojis.attent} Não foi possível executar este comando.`;

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: errorMessage,
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: errorMessage,
        ephemeral: true,
      });
    }
  }
};
