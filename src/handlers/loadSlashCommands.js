const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger.js');

async function registerSlashCommands(client) {
  try {
    const slashCommands = [];
    const commandsPath = path.join(__dirname, "../commands/slashCommands");
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const command = require(`${commandsPath}/${file}`);
      if (!command.data) {
        logger.warn(`O comando "${file}" não possui estrutura de Slash Command.`);
        continue;
      }
      slashCommands.push(command.data.toJSON());
      client.slashCommands.set(command.data.name, command);
    }

    if (slashCommands.length === 0) {
      logger.warn('Nenhum Slash Command encontrado.');
      return;
    }

    const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

    if (process.env.GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: slashCommands }
      );
      logger.info(`Slash Commands registrados no servidor: ${process.env.GUILD_ID}`);
    } else {
      await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: slashCommands }
      );
      logger.info('Slash Commands registrados globalmente.');
    }

  } catch (error) {
    logger.error(`Erro ao registrar Slash Commands: ${error.message}`);
  }
}

module.exports = registerSlashCommands;