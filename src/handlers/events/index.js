const path = require('path');
const fs = require('fs');

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

  try {
    const handler = require(path.join(__dirname, file));
    const exportName = aliasMap[baseName] || baseName;

    handlers[exportName] = handler;
  } catch (error) {
    console.error(`[Event Handler] Falha ao carregar '${file}': ${error.message}`);
  }
}

module.exports = handlers;
