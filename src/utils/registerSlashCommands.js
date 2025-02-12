const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const logger = require('./logger.js');

async function registerSlashCommands(client) {
  if (!process.env.TOKEN || !process.env.CLIENT_ID) {
    return logger.error('Erro: TOKEN ou CLIENT_ID não definidos no ambiente.');
  }

  if (!client.slashCommands || client.slashCommands.size === 0) {
    return logger.warn('Nenhum comando Slash foi carregado.');
  }

  const commands = client.slashCommands.map((cmd) => cmd.data.toJSON());
  const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

  try {
    logger.info(`[INFO] Registrando ${commands.length} Slash Commands...`);
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
    logger.info('[SUCESSO] Slash Commands registrados com sucesso!');
  } catch (error) {
    logger.error(`[ERRO] Falha ao registrar Slash Commands: ${error.message}`);
  }
}

module.exports = registerSlashCommands;