'use strict';

const fs = require('fs');
const path = require('path');
const logger = require('@utils/logger');

const handlers = Object.create(null);

const aliasMap = {
  aiHandler: 'handleAIResponse',
  antiLinkHandler: 'handleAntiLink',
  antiSpamHandler: 'handleAntiSpam',
  commandHandler: 'handleCommands',
  termsHandler: 'checkTerms',
};

/**
 * Carrega handlers de forma recursiva, inclusive subpastas.
 * @param {string} dir - Caminho do diretório de onde carregar
 */
function loadHandlers(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      loadHandlers(fullPath);
      continue;
    }

    if (!entry.name.endsWith('.js') || entry.name === 'index.js') continue;

    const baseName = path.basename(entry.name, '.js');
    const exportName = aliasMap[baseName] || baseName;

    try {
      const requiredModule = require(fullPath);

      const handlerFn =
        typeof requiredModule === 'function'
          ? requiredModule
          : requiredModule[exportName];

      if (typeof handlerFn !== 'function') {
        logger?.warn?.(`[handlers] '${entry.name}' não exporta uma função válida como '${exportName}'.`);
        continue;
      }

      handlers[exportName] = handlerFn;
      logger?.info?.(`[handlers] '${exportName}' carregado de '${fullPath.replace(process.cwd(), '')}'.`);
    } catch (error) {
      logger?.error?.(`[handlers] Erro ao carregar '${entry.name}': ${error.message}`, {
        stack: error.stack,
        path: fullPath,
      });
    }
  }
}

loadHandlers(__dirname);

module.exports = Object.freeze(handlers);
