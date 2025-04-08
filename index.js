require('dotenv').config();

const logger = require('./src/utils/logger.js');
const startBot = require('./src/bot.js');

process.on('uncaughtException', (error) => {
  logger.error(`Erro não tratado: ${error.message}`, {
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });
});

process.on('unhandledRejection', (reason, promise) => {
  logger.warn(`Promessa rejeitada não tratada: ${reason}`, {
    promise,
    timestamp: new Date().toISOString(),
  });
});

process.on('warning', (warning) => {
  const criticalWarnings = [
    'DeprecationWarning',
    'ExperimentalWarning',
    'UnhandledPromiseRejectionWarning',
  ];

  if (criticalWarnings.includes(warning.name)) {
    logger.warn(`[${warning.name}] ${warning.message}`, {
      stack: warning.stack,
      timestamp: new Date().toISOString(),
    });
  }
});

startBot();