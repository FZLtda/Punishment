const logger = require('@utils/logger');
const { emojis } = require('@config');

async function handleSlashCommand(interaction, client) {
  const command = client.slashCommands.get(interaction.commandName);
  if (!command) {
    return interaction.reply({
      content: `${emoji.attent} Este comando ainda não foi registrado.`,
      ephemeral: true,
    });
  }

  try {
    await command.execute(interaction);
  } catch {
    logger.error(`ERRO: Erro ao executar Slash Command "${interaction.commandName}": ${error.message}`, { stack: error.stack });
    await interaction.reply({
      content: `${emoji.attent} Não foi possível processar o comando.`,
      ephemeral: true,
    });
  }
}

module.exports = { handleSlashCommand };
