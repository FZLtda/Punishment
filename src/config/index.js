'use strict';

const fs = require('fs');
const path = require('path');

// Caminho absoluto do arquivo settings
const configPath = path.join(__dirname, 'settings.json');

// Verifica se o arquivo settings.json existe
if (!fs.existsSync(configPath)) {
  throw new Error('[Config] Arquivo "settings.json" não encontrado no diretório /config.');
}

// Carrega o settings.json de forma segura (sem cache)
let rawConfig;
try {
  delete require.cache[require.resolve('./settings.json')];
  rawConfig = require('./settings.json');
} catch (error) {
  throw new Error(`[Config] Erro ao carregar "settings.json": ${error.message}`);
}

// Validação de campos obrigatórios
const requiredFields = ['BOT_NAME', 'OWNER_ID', 'MAX_RETRIES', 'RETRY_DELAY'];
const missingFields = requiredFields.filter(field => rawConfig[field] === undefined || rawConfig[field] === null);

if (missingFields.length > 0) {
  throw new Error(`[Config] Campos obrigatórios ausentes em settings.json: ${missingFields.join(', ')}`);
}

// Função utilitária para carregar JSONs opcionais
const loadOptionalJson = (filename, defaultValue = {}) => {
  const filePath = path.join(__dirname, filename);
  try {
    if (fs.existsSync(filePath)) {
      delete require.cache[require.resolve(filePath)];
      return require(filePath);
    } else {
      console.warn(`[Config] ${filename} não encontrado. Usando valor padrão.`);
    }
  } catch (error) {
    console.warn(`[Config] Falha ao carregar ${filename}: ${error.message}`);
  }
  return defaultValue;
};

// Carregamento de arquivos opcionais
const emojis = loadOptionalJson('emojis.json');
const colors = loadOptionalJson('colors.json');
const warnChannels = loadOptionalJson('warnChannels.json');

// Exportação centralizada e imutável
module.exports = Object.freeze({
  ...rawConfig,
  emojis,
  colors,
  warnChannels
});
