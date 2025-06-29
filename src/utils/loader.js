'use strict';

const path = require('path');
const chalk = require('chalk');
const { performance } = require('perf_hooks');
const { Collection } = require('discord.js');
const logger = require('@utils/logger');
const loadFiles = require('@utils/fileLoader');

/**
 * Garante que as coleções do cliente existam com tipo correto.
 * @param {import('discord.js').Client} client
 */
function ensureCollections(client) {
  if (!(client.commands instanceof Collection)) client.commands = new Collection();
  if (!(client.slashCommands instanceof Collection)) client.slashCommands = new Collection();
}

/**
 * Carrega e registra todos os comandos (prefix e slash).
 * @param {import('discord.js').Client} client
 */
async function loadCommands(client) {
  ensureCollections(client);

  const commandsPath = path.join(__dirname, '..', 'commands');
  const commandFiles = loadFiles(commandsPath);

  if (!Array.isArray(commandFiles) || commandFiles.length === 0) {
    logger.warn('[Loader:Comandos] Nenhum comando encontrado para carregar.');
    return;
  }

  let prefixCount = 0;
  let slashCount = 0;
  const commandNames = new Set();

  for (const file of commandFiles) {
    const start = performance.now();
    try {
      const commandPath = path.isAbsolute(file) ? file : path.resolve(file);
      
      // Limpa cache para recarregar se necessário
      delete require.cache[require.resolve(commandPath)];
      const command = require(commandPath);

      const isSlash = !!command?.data;
      const name = (isSlash ? command?.data?.name : command?.name)?.toLowerCase?.();

      if (!name || typeof command.execute !== 'function') {
        logger.warn(`[Loader:Comando] Ignorado "${file}" → Estrutura inválida.`);
        continue;
      }

      if (commandNames.has(name)) {
        logger.warn(`[Loader:Comando] Ignorado "${file}" → Nome duplicado detectado: "${name}".`);
        continue;
      }

      commandNames.add(name);

      if (isSlash) {
        client.slashCommands.set(name, command);
        slashCount++;
        logger.debug(chalk.cyanBright(`[SLASH] /${name} carregado (${(performance.now() - start).toFixed(1)}ms)`));
      } else {
        client.commands.set(name, command);
        prefixCount++;
        logger.debug(chalk.magentaBright(`[PREFIX] ${name} carregado (${(performance.now() - start).toFixed(1)}ms)`));
      }

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
    chalk.greenBright(`[Loader] ${prefixCount} comandos prefix e ${slashCount} comandos slash carregados com sucesso.`)
  );

  // Diagnóstico final
  logger.debug(chalk.yellow(`Comandos prefix carregados: ${[...client.commands.keys()].join(', ') || 'Nenhum'}`));
  logger.debug(chalk.yellow(`Comandos slash carregados: ${[...client.slashCommands.keys()].join(', ') || 'Nenhum'}`));
}

/**
 * Carrega e registra todos os eventos.
 * @param {import('discord.js').Client} client
 */
async function loadEvents(client) {
  const eventsPath = path.join(__dirname, '..', 'events');
  const eventFiles = loadFiles(eventsPath);

  if (!Array.isArray(eventFiles) || eventFiles.length === 0) {
    logger.warn('[Loader:Eventos] Nenhum evento encontrado para carregar.');
    return;
  }

  let total = 0;

  for (const file of eventFiles) {
    const start = performance.now();

    try {
      const eventPath = path.isAbsolute(file) ? file : path.resolve(file);
      delete require.cache[require.resolve(eventPath)];
      const event = require(eventPath);

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
