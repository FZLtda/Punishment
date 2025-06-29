'use strict';

const fs = require('fs');
const path = require('path');
const logger = require('@utils/logger');

/**
 * Carrega recursivamente todos os arquivos `.js` e `.ts` de um diretório.
 * 
 * @param {string} dir - Caminho absoluto do diretório base.
 * @param {Object} [options]
 * @param {(filePath: string) => boolean} [options.filter] - Função para filtrar os arquivos.
 * @param {string[]} [options.ignoredDirs] - Lista de nomes de diretórios a ignorar.
 * @returns {string[]} Lista de caminhos absolutos dos arquivos encontrados.
 */
function loadFiles(dir, options = {}) {
  const { filter, ignoredDirs = ['__tests__', '__mocks__'] } = options;
  const result = [];

  /**
   * Lê o diretório recursivamente.
   * @param {string} currentPath
   */
  function recursiveRead(currentPath) {
    if (!fs.existsSync(currentPath)) {
      logger.warn(`[fileLoader] Diretório não encontrado: ${currentPath}`);
      return;
    }

    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        if (ignoredDirs.includes(entry.name)) {
          logger.debug(`[fileLoader] Diretório ignorado: ${fullPath}`);
          continue;
        }

        recursiveRead(fullPath);
      } else if (entry.name.endsWith('.js') || entry.name.endsWith('.ts')) {
        if (typeof filter === 'function' && !filter(fullPath)) continue;

        result.push(fullPath);
      }
    }
  }

  try {
    recursiveRead(dir);
    logger.debug(`[fileLoader] ${result.length} arquivos carregados de: ${dir}`);
    return result;
  } catch (err) {
    logger.error(`[fileLoader] Erro ao carregar arquivos de ${dir}: ${err.message}`, {
      stack: err.stack,
    });
    return [];
  }
}

module.exports = loadFiles;
