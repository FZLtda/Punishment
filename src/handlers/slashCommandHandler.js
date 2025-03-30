const logger = require('../utils/logger');

async function handleSlashCommand(interaction, client) {
  const command = client.slashCommands.get(interaction.commandName);
  if (!command) {
    return interaction.reply({
      content: 'Este comando não está registrado.',
      ephemeral: true,
    });
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    logger.error(`Erro ao executar Slash Command "${interaction.commandName}": ${error.message}`, { stack: error.stack });
    await interaction.reply({
      content: 'Ocorreu um erro ao executar este comando.',
      ephemeral: true,
    });
  }
}

module.exports = { handleSlashCommand };