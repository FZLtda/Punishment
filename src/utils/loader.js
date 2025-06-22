'use strict';

const path = require('path');
const chalk = require('chalk');
const logger = require('@utils/logger');
const loadFiles = require('@utils/fileLoader');

async function loadCommands(client) {
  const commandsPath = path.join(__dirname, '..', 'commands');
  const commandFiles = loadFiles(commandsPath);

  if (!Array.isArray(commandFiles) || commandFiles.length === 0) {
    return logger.warn('Nenhum comando encontrado para carregar.');
  }

  for (const file of commandFiles) {
    const start = performance.now();

    try {
      const command = require(file);
      const name = command?.data?.name?.toLowerCase() || command?.name?.toLowerCase();
      const type = command?.data ? 'slash' : 'prefix';

      if (!command || typeof command !== 'object' || !name) {
        logger.warn(`Ignorado: Estrutura inválida em ${file}`);
        continue;
      }

      if (type === 'slash') {
        client.slashCommands.set(name, command);
        logger.debug(chalk.blue(`[SLASH] ${name} carregado em ${(performance.now() - start).toFixed(1)}ms`));
      } else {
        client.commands.set(name, command);
        logger.debug(chalk.cyan(`[PREFIX] ${name} carregado em ${(performance.now() - start).toFixed(1)}ms`));
      }

      client.commandMetadata ??= [];
      client.commandMetadata.push({
        name,
        type,
        file: path.relative(process.cwd(), file),
        loadedAt: new Date(),
      });

    } catch (err) {
      logger.error(`Erro ao carregar comando ${file}: ${err.message}`, {
        stack: err.stack,
        file,
      });
    }
  }

  logger.info(chalk.greenBright(`${client.slashCommands.size} slash e ${client.commands.size} prefix comandos carregados.`));
}

async function loadEvents(client) {
  const eventsPath = path.join(__dirname, '..', 'events');
  const eventFiles = loadFiles(eventsPath);

  if (!Array.isArray(eventFiles) || eventFiles.length === 0) {
    return logger.warn('Nenhum evento encontrado para carregar.');
  }

  for (const file of eventFiles) {
    const start = performance.now();

    try {
      const event = require(file);

      if (!event?.name || typeof event.execute !== 'function') {
        logger.warn(`Ignorado: Estrutura inválida em ${file}`);
        continue;
      }

      const handler = (...args) => event.execute(...args, client);
      event.once ? client.once(event.name, handler) : client.on(event.name, handler);

      logger.debug(chalk.magenta(`[EVENT] ${event.name} registrado em ${(performance.now() - start).toFixed(1)}ms`));

    } catch (err) {
      logger.error(`Erro ao carregar evento ${file}: ${err.message}`, {
        stack: err.stack,
        file,
      });
    }
  }

  logger.info(chalk.greenBright(`${eventFiles.length} eventos carregados.`));
}

module.exports = { loadCommands, loadEvents };
