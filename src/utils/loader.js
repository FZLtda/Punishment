'use strict';

const path = require('path');
const chalk = require('chalk');
const { performance } = require('perf_hooks');
const logger = require('@utils/logger');
const loadFiles = require('@utils/fileLoader');

/**
 * Carrega e registra todos os comandos (prefix e slash).
 * @param {import('discord.js').Client} client
 */
async function loadCommands(client) {
  const commandsPath = path.join(__dirname, '..', 'commands');
  const commandFiles = loadFiles(commandsPath);

  if (!Array.isArray(commandFiles) || commandFiles.length === 0) {
    return logger.warn('[Loader:Comandos] Nenhum comando encontrado para carregar.');
  }

  let prefixCount = 0;
  let slashCount = 0;

  for (const file of commandFiles) {
    const start = performance.now();

    try {
      const command = require(file);
      const isSlash = !!command?.data;
      const name = (isSlash ? command.data.name : command.name)?.toLowerCase?.();

      if (!name || typeof command.execute !== 'function') {
        logger.warn(`[Loader:Comando] Ignorado "${file}" → Estrutura inválida.`);
        continue;
      }

      if (isSlash) {
        client.slashCommands.set(name, command);
        slashCount++;
        logger.debug(chalk.cyanBright(`[SLASH] /${name} carregado (${(performance.now() - start).toFixed(1)}ms)`));
      } else {
        client.commands.set(name, command);
        prefixCount++;
        logger.debug(chalk.magentaBright(`[PREFIX] ${name} carregado (${(performance.now() - start).toFixed(1)}ms)`));
      }

      // Metadata opcional para debug externo
      client.commandMetadata ??= [];
      client.commandMetadata.push({
        name,
        type: isSlash ? 'slash' : 'prefix',
        file: path.relative(process.cwd(), file),
        loadedAt: new Date(),
      });

    } catch (err) {
      logger.error(`[Loader:Comando] Erro ao carregar "${file}": ${err.message}`, {
        stack: err.stack,
        file,
      });
    }
  }

  logger.info(
    chalk.greenBright(`[Loader] ${prefixCount} comandos prefix e ${slashCount} slash carregados com sucesso.`)
  );
}

/**
 * Carrega e registra todos os eventos.
 * @param {import('discord.js').Client} client
 */
async function loadEvents(client) {
  const eventsPath = path.join(__dirname, '..', 'events');
  const eventFiles = loadFiles(eventsPath);

  if (!Array.isArray(eventFiles) || eventFiles.length === 0) {
    return logger.warn('[Loader:Eventos] Nenhum evento encontrado para carregar.');
  }

  let total = 0;

  for (const file of eventFiles) {
    const start = performance.now();

    try {
      const event = require(file);
      const name = event?.name;
      const once = !!event.once;

      if (!name || typeof event.execute !== 'function') {
        logger.warn(`[Loader:Evento] Ignorado "${file}" → Estrutura inválida.`);
        continue;
      }

      const handler = (...args) => event.execute(...args, client);
      once ? client.once(name, handler) : client.on(name, handler);

      logger.debug(chalk.blueBright(`[EVENT] ${name} registrado (${(performance.now() - start).toFixed(1)}ms)`));
      total++;

    } catch (err) {
      logger.error(`[Loader:Evento] Erro ao carregar "${file}": ${err.message}`, {
        stack: err.stack,
        file,
      });
    }
  }

  logger.info(chalk.greenBright(`[Loader] ${total} eventos registrados com sucesso.`));
}

module.exports = {
  loadCommands,
  loadEvents,
};
