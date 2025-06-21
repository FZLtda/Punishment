'use strict';

const path = require('path');
const logger = require('@utils/logger');
const loadFiles = require('@utils/fileLoader');
const chalk = require('chalk');

async function loadCommands(client) {
  const commandsPath = path.join(__dirname, '@commands');
  const commandFiles = loadFiles(commandsPath);

  for (const file of commandFiles) {
    const start = Date.now();

    try {
      const command = require(file);

      if (!command || typeof command !== 'object') {
        logger.warn(`Ignorado: estrutura inválida em ${file}`);
        continue;
      }

      const name = command.data?.name?.toLowerCase() || command.name?.toLowerCase();
      const type = command.data ? 'slash' : 'prefix';

      if (!name) {
        logger.warn(`Ignorado: nome ausente em ${file}`);
        continue;
      }

      if (type === 'slash') {
        client.slashCommands.set(name, command);
        logger.info(chalk.blueBright(`[SLASH] ${name} carregado (${Date.now() - start}ms)`));
      } else {
        client.commands.set(name, command);
        logger.info(chalk.cyan(`[PREFIX] ${name} carregado (${Date.now() - start}ms)`));
      }

      client.commandMetadata ||= [];
      client.commandMetadata.push({
        name,
        file,
        type,
        loadedAt: new Date(),
      });

    } catch (err) {
      logger.error(`Erro ao carregar comando ${file}: ${err.message}`, { stack: err.stack });
    }
  }
}

async function loadEvents(client) {
  const eventsPath = path.join(__dirname, '../events');
  const eventFiles = loadFiles(eventsPath);

  for (const file of eventFiles) {
    const start = Date.now();

    try {
      const event = require(file);

      if (!event.name || typeof event.execute !== 'function') {
        logger.warn(`Ignorado: estrutura inválida em ${file}`);
        continue;
      }

      const handler = (...args) => event.execute(...args, client);

      if (event.once) {
        client.once(event.name, handler);
      } else {
        client.on(event.name, handler);
      }

      logger.info(chalk.magenta(`[EVENT] ${event.name} carregado (${Date.now() - start}ms)`));

    } catch (err) {
      logger.error(`Erro ao carregar evento ${file}: ${err.message}`, { stack: err.stack });
    }
  }
}

module.exports = { loadCommands, loadEvents };
