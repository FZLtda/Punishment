const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'config.json');

if (!fs.existsSync(configPath)) {
  throw new Error('[Config] Arquivo config.json não encontrado em src/config/');
}

let config;

try {
  config = require('./config.json');
} catch (error) {
  throw new Error(`[Config] Erro ao carregar config.json: ${error.message}`);
}

// Verifica se os campos obrigatórios existem
const requiredFields = ['BOT_NAME', 'MAX_RETRIES', 'RETRY_DELAY', 'TOKEN', 'OWNER_ID'];
const missingFields = requiredFields.filter(field => config[field] === undefined);

if (missingFields.length > 0) {
  throw new Error(`[Config] Campos ausentes em config.json: ${missingFields.join(', ')}`);
}

module.exports = {
  ...config
};
