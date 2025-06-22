'use strict';

const fs = require('fs');
const path = require('path');
const logger = require('@utils/logger');

// Leitura segura de JSON
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

const settingsPath = path.join(__dirname, 'settings.json');

// Verificação
if (!fs.existsSync(settingsPath)) {
  throw new Error('[Config] Arquivo settings.json não encontrado.');
}

const settings = loadJsonFile(settingsPath, true);

// Validação de campos obrigatórios
const requiredFields = ['BOT_NAME', 'OWNER_ID', 'MAX_RETRIES', 'RETRY_DELAY'];
const missing = requiredFields.filter(key => settings[key] === undefined || settings[key] === null);

if (missing.length > 0) {
  throw new Error(`[Config] Campos obrigatórios ausentes: ${missing.join(', ')}`);
}

// Exporta apenas o settings completo (que já tem emojis e cores embutidos)
module.exports = Object.freeze(settings);
