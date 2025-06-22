'use strict';

const fs = require('fs');
const path = require('path');

// Objeto final congelado
const handlers = {};

const aliasMap = {
  handleButton: 'handleButton',
  router: 'router',
  buttons: 'buttons'
};

for (const [alias, fileOrFolder] of Object.entries(aliasMap)) {
  const fullPath = path.join(__dirname, fileOrFolder);

  try {
    // Verifica se existe antes de importar
    if (!fs.existsSync(fullPath + '.js') && !fs.existsSync(fullPath)) {
      console.warn(`[Interaction Handler] Caminho não encontrado: ${fileOrFolder}`);
      continue;
    }

    const loaded = require(fullPath);

    if (!loaded || typeof loaded !== 'object') {
      console.warn(`[Interaction Handler] Módulo '${fileOrFolder}' é inválido ou vazio.`);
    }

    handlers[alias] = loaded;
  } catch (err) {
    console.error(`[Interaction Handler] Falha ao carregar '${fileOrFolder}': ${err.message}`);
  }
}

module.exports = Object.freeze(handlers);
