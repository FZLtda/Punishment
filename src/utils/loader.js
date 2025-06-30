'use strict';

const path = require('path');
const chalk = require('chalk');
const { performance } = require('perf_hooks');
const { Collection } = require('discord.js');
const logger = require('@utils/logger');
const loadFiles = require('@utils/fileLoader');
const { validateCommandFile } = require('@utils/commandValidator');

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

  // Diagnóstico estrutural
  const commandNamesValidation = new Set();
  const validationResults = commandFiles.map(f => validateCommandFile(f, commandNamesValidation));
  const failed = validationResults.filter(r => r.issues.length > 0);
  if (failed.length > 0) {
    console.warn('\n🔍 Diagnóstico de Comandos com Problemas:\n');
    for (const result of failed) {
      console.warn(`Arquivo: ${result.path}`);
      result.issues.forEach(issue => console.warn(`   ${issue}`));
    }
    console.warn('\nAlguns comandos foram ignorados por falhas estruturais. Verifique os detalhes acima.\n');
  }

  let prefixCount = 0;
  let slashCount = 0;
  const commandNames = new Set();

  for (const file of commandFiles) {
    const start = performance.now();

    try {
      const commandPath = path.isAbsolute(file) ? file : path.resolve(file);
      delete require.cache[require.resolve(commandPath)];
      const command = require(commandPath);

      const isSlash = !!command?.data;
      const name = (isSlash ? command?.data?.name : command?.name)?.toLowerCase?.();

      // Ignorar comandos inválidos
      if (!name || typeof command.execute !== 'function') continue;
      if (commandNames.has(name)) continue;
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

  logger.info(chalk.greenBright(`[Loader] ${prefixCount} comandos prefix e ${slashCount} comandos slash carregados com sucesso.`));
  logger.debug(chalk.yellow(`Comandos prefix carregados: ${[...client.commands.keys()].join(', ') || 'Nenhum'}`));
  logger.debug(chalk.yellow(`Comandos slash carregados: ${[...client.slashCommands.keys()].join(', ') || 'Nenhum'}`));
}
