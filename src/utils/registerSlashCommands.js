const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const logger = require('./logger.js');

async function registerSlashCommands(client) {
  const commands = client.slashCommands.map((cmd) => cmd.data.toJSON());
  const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

  try {
    logger.info('Registrando Slash Commands...');
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
    logger.info('Slash Commands registrados com sucesso!');
  } catch (error) {
    logger.error(`Erro ao registrar Slash Commands: ${error.message}`);
  }
}

module.exports = registerSlashCommands;