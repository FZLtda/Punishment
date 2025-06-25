'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Carrega recursivamente todos os arquivos `.js` e `.ts` de um diretório.
 * @param {string} dir - Caminho absoluto do diretório a ser lido.
 * @returns {string[]} Lista de caminhos absolutos dos arquivos encontrados.
 */
function loadFiles(dir) {
  const result = [];

  function recursiveRead(currentPath) {
    if (!fs.existsSync(currentPath)) {
      console.warn(`[fileLoader] Diretório não encontrado: ${currentPath}`);
      return;
    }

    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        recursiveRead(fullPath);
      } else if (entry.name.endsWith('.js') || entry.name.endsWith('.ts')) {
        result.push(fullPath);
      }
    }
  }

  try {
    recursiveRead(dir);
    return result;
  } catch (err) {
    console.error(`[fileLoader] Erro ao carregar arquivos de ${dir}: ${err.message}`, {
      stack: err.stack,
    });
    return [];
  }
}

module.exports = loadFiles;
