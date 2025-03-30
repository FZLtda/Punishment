const logger = require('../utils/logger');

async function handleSlashCommand(interaction, client) {
  const command = client.slashCommands.get(interaction.commandName);
  if (!command) {
    return interaction.reply({
      content: '<:Erro:1356016602994180266> Este comando não está registrado.',
      ephemeral: true,
    });
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    logger.error(`ERRO: Erro ao executar Slash Command "${interaction.commandName}": ${error.message}`, { stack: error.stack });
    await interaction.reply({
      content: '<:Erro:1356016602994180266> Não foi possível processar o comando.',
      ephemeral: true,
    });
  }
}

module.exports = { handleSlashCommand };