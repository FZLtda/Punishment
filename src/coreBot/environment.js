'use strict';

const Logger = require('@logger');

/**
 * Lista de variáveis de ambiente obrigatórias agrupadas por responsabilidade
 */
const REQUIRED_ENV_VARS = {
  Discord: ['TOKEN', 'CLIENT_ID', 'OWNER_ID', 'DEFAULT_PREFIX', 'COMMAND_SCOPE'],
  MongoDB: ['MONGO_URI'],
  Stripe: ['STRIPE_SECRET_KEY'],
  Webhook: ['WEBHOOK', 'LOG_CHANNEL'],
  Logging: ['LOG_LEVEL']
};

/**
 * Valida se todas as variáveis de ambiente obrigatórias estão definidas.
 * Encerra o processo em caso de ausência de qualquer uma.
 * 
 * @function validateEnvironment
 * @returns {void}
 */
function validateEnvironment() {
  const missing = [];

  for (const [group, keys] of Object.entries(REQUIRED_ENV_VARS)) {
    for (const key of keys) {
      if (!process.env[key]) {
        missing.push({ key, group });
      }
    }
  }

  if (missing.length > 0) {
    missing.forEach(({ key, group }) => {
      Logger.error(`Variável ausente [${group}]: ${key}`);
    });

    Logger.fatal(`Inicialização abortada. Variáveis faltando: ${missing.map(m => m.key).join(', ')}`);
    Logger.warn('Verifique seu arquivo .env e defina as variáveis necessárias.');
    process.exit(1);
  }

  Logger.info('Todas as variáveis de ambiente obrigatórias foram validadas com sucesso.');
}

module.exports = {
  validateEnvironment
};
