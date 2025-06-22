'use strict';

const fs = require('fs');
const path = require('path');
const logger = require('@utils/logger');

// Utilitário seguro de leitura de JSON
const loadJsonFile = (filePath, required = false) => {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    if (required) {
      throw new Error(`[Config] Falha ao carregar ${filePath}: ${err.message}`);
    } else {
      console.warn(`[Config] ${path.basename(filePath)} ignorado: ${err.message}`);
      return {};
    }
  }
};

// Caminhos
const settingsPath = path.join(__dirname, 'settings.json');
const emojisPath = path.join(__dirname, 'emojis.json');
const colorsPath = path.join(__dirname, 'colors.json');
const warnChannelsPath = path.join(__dirname, 'warnChannels.json');

// Verifica existência do settings.json
if (!fs.existsSync(settingsPath)) {
  throw new Error('[Config] Arquivo settings.json não encontrado.');
}

// Carrega e valida settings
const settings = loadJsonFile(settingsPath, true);

const requiredFields = ['BOT_NAME', 'OWNER_ID', 'MAX_RETRIES', 'RETRY_DELAY'];
const missing = requiredFields.filter(key => settings[key] === undefined || settings[key] === null);

if (missing.length > 0) {
  throw new Error(`[Config] Campos obrigatórios ausentes: ${missing.join(', ')}`);
}

// Arquivos opcionais
const emojis = Object.freeze(loadJsonFile(emojisPath));
const colors = Object.freeze(loadJsonFile(colorsPath));
const warnChannels = Object.freeze(loadJsonFile(warnChannelsPath));

// Exportação final congelada
module.exports = Object.freeze({
  ...settings,
  emojis,
  colors,
  warnChannels
});
