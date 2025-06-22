'use strict';

const { handleSlashCommand } = require('@handleSlash/slashCommandHandler');
const logger = require('@utils/logger');
const { emojis } = require('@config');

module.exports = async function handleCommand(interaction, client) {
  try {
    await handleSlashCommand(interaction, client);
  } catch (error) {
    logger.error(`Erro ao executar comando "${interaction.commandName}"`, {
      message: error.message,
      stack: error.stack,
      user: `${interaction.user?.tag} (${interaction.user?.id})`,
      guild: `${interaction.guild?.name || 'DM'} (${interaction.guildId || 'N/A'})`,
    });

    const errorMessage = `${emojis.attent} Não foi possível executar este comando no momento.`;

    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: errorMessage, ephemeral: true });
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true });
      }
    } catch (replyError) {
      logger.warn(`Falha ao enviar resposta de erro para ${interaction.user?.tag}: ${replyError.message}`);
    }
  }
};
