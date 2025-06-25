'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Carrega recursivamente todos os arquivos `.js` e `.ts` de um diretório.
 * @param {string} dir - Caminho absoluto do diretório a ser lido.
 * @returns {string[]} Lista de caminhos absolutos dos arquivos encontrados.
 */
function loadFiles(dir) {
  try {
    if (!fs.existsSync(dir)) {
      console.warn(`[loadFiles] Diretório não encontrado: ${dir}`);
      return [];
    }

    const files = fs.readdirSync(dir, { withFileTypes: true });

    return files.flatMap(file => {
      const filePath = path.join(dir, file.name);

      if (file.isDirectory()) {
        return loadFiles(filePath);
      }

      const isValidExtension = file.name.endsWith('.js') || file.name.endsWith('.ts');
      return isValidExtension ? [filePath] : [];
    });
  } catch (error) {
    console.error(`[loadFiles] Erro ao ler arquivos de ${dir}:`, error);
    return [];
  }
}

module.exports = loadFiles;
