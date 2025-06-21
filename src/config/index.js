const fs = require('fs');
const path = require('path');

// Caminho absoluto para settings.json
const configPath = path.join(__dirname, 'settings.json');

// Verifica se o settings.json existe
if (!fs.existsSync(configPath)) {
  throw new Error('[Config] Arquivo settings.json não encontrado.');
}

// Tenta carregar o settings.json
let config;
try {
  config = require('./settings.json');
} catch (error) {
  throw new Error(`[Config] Erro ao carregar settings.json: ${error.message}`);
}

// Campos obrigatórios que precisam estar no settings.json
const requiredFields = ['BOT_NAME', 'OWNER_ID', 'MAX_RETRIES', 'RETRY_DELAY'];
const missingFields = requiredFields.filter(field => config[field] === undefined);

if (missingFields.length > 0) {
  throw new Error(`[Config] Campos ausentes em settings.json: ${missingFields.join(', ')}`);
}

// Carrega arquivos adicionais da pasta config
let emojis = {};
let colors = {};
let warnChannels = {};

try {
  emojis = require('./emojis.json');
} catch (error) {
  console.warn('[Config] emojis.json não encontrado ou inválido, ignorando...');
}

try {
  colors = require('./colors.json');
} catch (error) {
  console.warn('[Config] colors.json não encontrado ou inválido, ignorando...');
}

try {
  warnChannels = require('./warnChannels.json');
} catch (error) {
  console.warn('[Config] warnChannels.json não encontrado ou inválido, ignorando...');
}

// Exporta tudo de forma centralizada
module.exports = {
  ...config,
  emojis,
  colors,
  warnChannels
};
