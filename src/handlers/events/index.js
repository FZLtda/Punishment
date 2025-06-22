'use strict';

const fs = require('fs');
const path = require('path');

const handlers = {};

const aliasMap = {
  aiHandler: 'handleAIResponse',
  antiLinkHandler: 'handleAntiLink',
  antiSpamHandler: 'handleAntiSpam',
  commandHandler: 'handleCommands',
  termsHandler: 'checkTerms'
};

function loadHandlers(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      loadHandlers(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.js') && entry.name !== 'index.js') {
      const baseName = path.basename(entry.name, '.js');
      const exportName = aliasMap[baseName] || baseName;

      try {
        const handler = require(fullPath);

        if (typeof handler !== 'function' && typeof handler !== 'object') {
          console.warn(`[Event Handler] '${entry.name}' exporta tipo inválido (${typeof handler}).`);
          continue;
        }

        handlers[exportName] = handler;
      } catch (error) {
        console.error(`[Event Handler] Erro ao carregar '${entry.name}': ${error.message}`);
      }
    }
  }
}

loadHandlers(__dirname);

module.exports = Object.freeze(handlers);
