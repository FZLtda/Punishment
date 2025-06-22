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
  commandSlash: 'handleCommand',
  termsHandler: 'checkTerms',
};

/**
 * Carrega todos os handlers de forma recursiva.
 * @param {string} dir Diretório para carregar handlers
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
      const mod = require(fullPath);

      const handlerFn = mod?.[exportName] || (typeof mod === 'function' ? mod : null);

      if (typeof handlerFn !== 'function') {
        logger.warn(`[handlers] Handler inválido em '${entry.name}'. Exportação esperada: '${exportName}'`);
        continue;
      }

      handlers[exportName] = handlerFn;
      logger.info(`[handlers] Handler '${exportName}' carregado de: ${fullPath.replace(process.cwd(), '.')}`);
    } catch (err) {
      logger.error(`[handlers] Erro ao carregar '${entry.name}': ${err.message}`, {
        stack: err.stack,
        file: fullPath,
      });
    }
  }
}

loadHandlers(__dirname);

module.exports = Object.freeze(handlers);
