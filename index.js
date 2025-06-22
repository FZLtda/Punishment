require('module-alias/register');
require('dotenv').config();
const os = require('os');
const logger = require('@utils/logger');
const startBot = require('@src/bot');
const connectDatabase = require('@utils/database');

const processInfo = {
  pid: process.pid,
  hostname: os.hostname(),
};

process.on('uncaughtException', (error) => {
  logger.error(`Erro não tratado: ${error.message}`, {
    ...processInfo,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });
});

process.on('unhandledRejection', (reason, promise) => {
  logger.warn(`Promessa rejeitada não tratada: ${reason}`, {
    ...processInfo,
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
      ...processInfo,
      stack: warning.stack,
      timestamp: new Date().toISOString(),
    });
  }
});

const gracefulShutdown = async () => {
  logger.info('Finalizando o bot com segurança...');
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

(async () => {
  await connectDatabase();
  await startBot();
})();
