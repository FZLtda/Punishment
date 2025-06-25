'use strict';

const fs = require('fs');
const path = require('path');
const logger = require('@utils/logger');

const handlers = Object.create(null);

// Mapear arquivos para nomes padronizados no código
const aliasMap = {
  aiHandler: 'handleAIResponse',
  antiLinkHandler: 'handleAntiLink',
  antiSpamHandler: 'handleAntiSpam',
  commandHandler: 'handleCommands',
  commandSlash: 'handleCommand',
  termsHandler: 'checkTerms',
};

/**
 * Carrega recursivamente todos os handlers e os expõe com nomes padronizados.
 * @param {string} dir Diretório base para leitura dos arquivos de handler.
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

      // Suporte tanto para default export (function) quanto para objeto nomeado
      const handlerFn =
        typeof mod === 'function'
          ? mod
          : typeof mod?.[exportName] === 'function'
          ? mod[exportName]
          : null;

      if (!handlerFn) {
        logger.warn(`[handlers] Handler inválido em '${entry.name}'. Nenhuma exportação compatível encontrada para '${exportName}'.`);
        continue;
      }

      handlers[exportName] = handlerFn;

      logger.debug(`[handlers] '${exportName}' carregado de: ${fullPath.replace(process.cwd(), '.')}`);

    } catch (err) {
      logger.error(`[handlers] Erro ao carregar handler '${entry.name}': ${err.message}`, {
        stack: err.stack,
        file: fullPath,
      });
    }
  }
}

// Inicializa o carregamento dos handlers no momento da importação
loadHandlers(__dirname);

module.exports = Object.freeze(handlers);
