const fs = require('fs');
const path = require('path');

// Caminho absoluto para config.json
const configPath = path.join(__dirname, 'config.json');

// Verifica se o config.json existe
if (!fs.existsSync(configPath)) {
  throw new Error('[Config] Arquivo config.json não encontrado.');
}

// Tenta carregar o config.json
let config;
try {
  config = require('./config.json');
} catch (error) {
  throw new Error(`[Config] Erro ao carregar config.json: ${error.message}`);
}

// Campos obrigatórios que precisam estar no config.json
const requiredFields = ['BOT_NAME', 'OWNER_ID', 'MAX_RETRIES', 'RETRY_DELAY'];
const missingFields = requiredFields.filter(field => config[field] === undefined);

if (missingFields.length > 0) {
  throw new Error(`[Config] Campos ausentes em config.json: ${missingFields.join(', ')}`);
}

// Carrega arquivos adicionais da pasta config
let emojis = {};
let colors = {};
let messages = {};

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
  console.warn('[Config] messages.js não encontrado ou inválido, ignorando...');
}

// Exporta tudo de forma centralizada
module.exports = {
  ...config,
  emojis,
  colors,
  messages
};
