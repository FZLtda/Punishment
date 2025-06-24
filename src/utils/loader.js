'use strict';

const path = require('path');
const chalk = require('chalk');
const logger = require('@utils/logger');
const loadFiles = require('@utils/fileLoader');

/**
 * Carrega todos os comandos (prefix e slash).
 * @param {import('discord.js').Client} client
 */
async function loadCommands(client) {
  const commandsPath = path.join(__dirname, '..', 'commands');
  const commandFiles = loadFiles(commandsPath);

  if (!Array.isArray(commandFiles) || commandFiles.length === 0) {
    logger.warn('[Loader] Nenhum comando encontrado para carregar.');
    return;
  }

  for (const file of commandFiles) {
    const start = performance.now();

    try {
      const command = require(file);
      const name = command?.data?.name?.toLowerCase?.() || command?.name?.toLowerCase?.();
      const isSlash = !!command?.data;

      if (!name || typeof command !== 'object') {
        logger.warn(`[Loader] Ignorado: Estrutura inválida em ${file}`);
        continue;
      }

      if (isSlash) {
        client.slashCommands.set(name, command);
        logger.debug(chalk.greenBright(`[SLASH] ${name} carregado em ${(performance.now() - start).toFixed(1)}ms`));
      } else {
        client.commands.set(name, command);
        logger.debug(chalk.greenBright(`[PREFIX] ${name} carregado em ${(performance.now() - start).toFixed(1)}ms`));
      }

      client.commandMetadata ??= [];
      client.commandMetadata.push({
        name,
        type: isSlash ? 'slash' : 'prefix',
        file: path.relative(process.cwd(), file),
        loadedAt: new Date(),
      });

    } catch (err) {
      logger.error(`[Loader] Erro ao carregar comando ${file}: ${err.message}`, {
        stack: err.stack,
        file,
      });
    }
  }

  logger.info(
    chalk.greenBright(`[Loader] ${client.slashCommands.size} slash e ${client.commands.size} prefix comandos carregados.`)
  );
}

/**
 * Carrega todos os eventos e os registra no client.
 * @param {import('discord.js').Client} client
 */
async function loadEvents(client) {
  const eventsPath = path.join(__dirname, '..', 'events');
  const eventFiles = loadFiles(eventsPath);

  if (!Array.isArray(eventFiles) || eventFiles.length === 0) {
    logger.warn('[Loader] Nenhum evento encontrado para carregar.');
    return;
  }

  for (const file of eventFiles) {
    const start = performance.now();

    try {
      const event = require(file);
      const eventName = event?.name;

      if (!eventName || typeof event.execute !== 'function') {
        logger.warn(`[Loader] Ignorado: Estrutura inválida em ${file}`);
        continue;
      }

      const boundHandler = (...args) => event.execute(...args, client);
      event.once ? client.once(eventName, boundHandler) : client.on(eventName, boundHandler);

      logger.debug(chalk.greenBright(`[EVENT] ${eventName} registrado em ${(performance.now() - start).toFixed(1)}ms`));

    } catch (err) {
      logger.error(`[Loader] Erro ao carregar evento ${file}: ${err.message}`, {
        stack: err.stack,
        file,
      });
    }
  }

  logger.info(chalk.greenBright(`[Loader] ${eventFiles.length} eventos carregados.`));
}

module.exports = {
  loadCommands,
  loadEvents,
};
