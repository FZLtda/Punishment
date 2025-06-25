'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Carrega (ou cria) um arquivo de configurações JSON.
 * @param {string} relativePath - Caminho relativo ao diretório base.
 * @returns {Record<string, any>} Objeto com as configurações carregadas.
 */
function loadSettings(relativePath) {
  try {
    const resolvedPath = path.resolve(__dirname, '..', relativePath);
    const dir = path.dirname(resolvedPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(resolvedPath)) {
      fs.writeFileSync(resolvedPath, '{}', 'utf8');
    }

    const content = fs.readFileSync(resolvedPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`[SettingsLoader] Falha ao carregar "${relativePath}":`, error);
    return {};
  }
}

module.exports = { loadSettings };
