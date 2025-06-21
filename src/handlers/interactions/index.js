const fs = require('fs');
const path = require('path');

const handlers = {};

const aliasMap = {
  handleButton: 'handleButton',
  router: 'router',
  buttons: 'buttons'
};

for (const [alias, fileOrFolder] of Object.entries(aliasMap)) {
  try {
    handlers[alias] = require(path.join(__dirname, fileOrFolder));
  } catch (err) {
    console.error(`[Interaction Handler] Falha ao carregar '${fileOrFolder}': ${err.message}`);
  }
}

module.exports = handlers;
