'use strict';

const path = require('path');
const chalk = require('chalk');
const { performance } = require('perf_hooks');
const { Collection } = require('discord.js');
const logger = require('@utils/logger');
const loadFiles = require('@utils/fileLoader');

/**
 * Garante que as coleções do cliente estejam definidas corretamente.
 * @param {import('discord.js').Client} client
 */
function ensureCollections(client) {
  if (!(client.commands instanceof Collection)) client.commands = new Collection();
  if (!(client.slashCommands instanceof Collection)) client.slashCommands = new Collection();
  client.commandMetadata ??= [];
}

/**
 * Carrega todos os comandos (prefix e slash) de forma modular.
 * @param {import('discord.js').Client} client
 */
async function loadCommands(client) {
  ensureCollections(client);

  const basePath = path.join(__dirname, '..', 'commands');
  const files = loadFiles(basePath);

  if (!Array.isArray(files) || files.length === 0) {
    logger.warn('[Loader:Comandos] Nenhum comando encontrado.');
    return;
  }

  let prefixCount = 0;
  let slashCount = 0;
  const seen = new Set();

  for (const file of files) {
    const start = performance.now();
    try {
      const absolute = path.resolve(file);
      delete require.cache[require.resolve(absolute)];
      const command = require(absolute);

      const isSlash = !!command?.data;
      const name = (isSlash ? command?.data?.name : command?.name)?.toLowerCase?.();

      if (!name || typeof command.execute !== 'function') {
        logger.warn(`[Loader:Comando] Ignorado "${file}" → estrutura inválida.`);
        continue;
      }

      if (seen.has(name)) {
        logger.warn(`[Loader:Comando] Ignorado "${file}" → nome duplicado: "${name}".`);
        continue;
      }

      seen.add(name);

      if (isSlash) {
        client.slashCommands.set(name, command);
        slashCount++;
        logger.debug(chalk.cyanBright(`[SLASH] /${name} carregado (${(performance.now() - start).toFixed(1)}ms)`));
      } else {
        client.commands.set(name, command);
        prefixCount++;
        logger.debug(chalk.magentaBright(`[PREFIX] ${name} carregado (${(performance.now() - start).toFixed(1)}ms)`));
      }

      client.commandMetadata.push({
        name,
        type: isSlash ? 'slash' : 'prefix',
        file: path.relative(process.cwd(), file),
        loadedAt: new Date(),
      });

    } catch (err) {
      logger.error(`[Loader:Comando] Falha em "${file}": ${err.message}`, {
        stack: err.stack,
        file
      });
    }
  }

  logger.info(chalk.greenBright(
    `[Loader] ${prefixCount} prefix e ${slashCount} slash carregados com sucesso.`
  ));

  logger.debug(chalk.yellow(
    `Prefix: ${[...client.commands.keys()].join(', ') || 'Nenhum'}`
  ));
  logger.debug(chalk.yellow(
    `Slash: ${[...client.slashCommands.keys()].join(', ') || 'Nenhum'}`
  ));
}

/**
 * Carrega todos os eventos do sistema.
 * @param {import('discord.js').Client} client
 */
async function loadEvents(client) {
  const basePath = path.join(__dirname, '..', 'events');
  const files = loadFiles(basePath);

  if (!Array.isArray(files) || files.length === 0) {
    logger.warn('[Loader:Eventos] Nenhum evento encontrado.');
    return;
  }

  let total = 0;

  for (const file of files) {
    const start = performance.now();

    try {
      const absolute = path.resolve(file);
      delete require.cache[require.resolve(absolute)];
      const event = require(absolute);

      const name = event?.name;
      const once = !!event.once;

      if (!name || typeof event.execute !== 'function') {
        logger.warn(`[Loader:Evento] Ignorado "${file}" → estrutura inválida.`);
        continue;
      }

      const handler = (...args) => event.execute(...args, client);
      once ? client.once(name, handler) : client.on(name, handler);

      logger.debug(chalk.blueBright(
        `[EVENT] ${name} registrado (${(performance.now() - start).toFixed(1)}ms)`
      ));
      total++;

    } catch (err) {
      logger.error(`[Loader:Evento] Falha em "${file}": ${err.message}`, {
        stack: err.stack,
        file
      });
    }
  }

  logger.info(chalk.greenBright(`[Loader] ${total} eventos registrados.`));
}

module.exports = {
  loadCommands,
  loadEvents
};
