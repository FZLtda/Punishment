const logger = require('./logger');

function validateEnv() {
  const requiredEnvVars = [
    'TOKEN',
    'CLIENT_ID',
    'GITHUB_TOKEN',
    'DEEPL_API_KEY',
    'OPENAI_API_KEY',
    'GIPHY_API_KEY',
    'STRIPE_SECRET_KEY',
    'API_URL_TRANSLATE',
    'API_URL_DOCUMENT',
    'WEBHOOK',
  ];

  const missingVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missingVars.length > 0) {
    logger.error(`Variáveis de ambiente ausentes: ${missingVars.join(', ')}`);
    process.exit(1);
  }

  const validations = {
    TOKEN: (value) => value.startsWith('M'),
    CLIENT_ID: (value) => /^\d+$/.test(value),
    GITHUB_TOKEN: (value) => value.startsWith('ghu_'),
    DEEPL_API_KEY: (value) => value.includes(':fx'),
    OPENAI_API_KEY: (value) => value.startsWith('sk-'),
    GIPHY_API_KEY: (value) => value.length === 32,
    STRIPE_SECRET_KEY: (value) => value.startsWith('rk_live_'),
    API_URL_TRANSLATE: (value) => value.startsWith('https://'),
    API_URL_DOCUMENT: (value) => value.startsWith('https://'),
    WEBHOOK: (value) => value.startsWith('https://discord.com/api/webhooks/'),
  };

  const maskValue = (value) => value ? `${value.slice(0, 4)}...${value.slice(-4)}` : 'undefined';

  for (const [key, validate] of Object.entries(validations)) {
    if (!validate(process.env[key])) {
      logger.error(`Variável de ambiente ${key} é inválida. Valor recebido: ${maskValue(process.env[key])}`);
      process.exit(1);
    } else {
      logger.info(`Variável de ambiente ${key} validada com sucesso.`);
    }
  }

  logger.info('Todas as variáveis de ambiente foram validadas com sucesso.');
}

module.exports = validateEnv;