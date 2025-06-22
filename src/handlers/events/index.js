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

const files = fs
  .readdirSync(__dirname)
  .filter(file => file !== 'index.js' && file.endsWith('.js'));

for (const file of files) {
  const baseName = path.basename(file, '.js');
  const resolvedPath = path.join(__dirname, file);
  const exportName = aliasMap[baseName] || baseName;

  try {
    const handler = require(resolvedPath);

    if (typeof handler !== 'function' && typeof handler !== 'object') {
      console.warn(`[Event Handler] '${file}' exporta tipo inválido (${typeof handler}).`);
      continue;
    }

    handlers[exportName] = handler;
  } catch (error) {
    console.error(`[Event Handler] Erro ao carregar '${file}': ${error.message}`);
  }
}

module.exports = Object.freeze(handlers);
