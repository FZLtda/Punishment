'use strict';

require('dotenv').config();
require('module-alias/register');

const os = require('os');
const logger = require('@utils/logger');
const connectDatabase = require('@utils/database');
const startBot = require('@src/bot');
const config = require('@config');

const processInfo = {
  pid: process.pid,
  hostname: os.hostname(),
  platform: process.platform,
  uptime: () => `${Math.floor(process.uptime())}s`
};

process.on('uncaughtException', (error) => {
  logger.fatal(`[${config.BOT_NAME}] Erro não tratado: ${error.message}`, {
    ...processInfo,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.fatal(`[${config.BOT_NAME}] Rejeição não tratada: ${reason?.message || reason}`, {
    ...processInfo,
    stack: reason?.stack,
    timestamp: new Date().toISOString(),
  });
  process.exit(1);
});

process.on('warning', (warning) => {
  const criticalWarnings = [
    'DeprecationWarning',
    'ExperimentalWarning',
    'UnhandledPromiseRejectionWarning',
  ];

  if (criticalWarnings.includes(warning.name)) {
    logger.warn(`[${config.BOT_NAME}] [${warning.name}] ${warning.message}`, {
      ...processInfo,
      stack: warning.stack,
      timestamp: new Date().toISOString(),
    });
  }
});

const gracefulShutdown = async (signal) => {
  logger.warn(`[${config.BOT_NAME}] Encerramento solicitado (${signal}). Finalizando recursos...`);

  const shutdownTimer = setTimeout(() => {
    logger.error(`[${config.BOT_NAME}] Shutdown forçado após timeout.`);
    process.exit(1);
  }, 10000);

  try {
    clearTimeout(shutdownTimer);
    logger.info(`[${config.BOT_NAME}] Encerramento concluído com sucesso.`);
    process.exit(0);
  } catch (err) {
    clearTimeout(shutdownTimer);
    logger.error(`[${config.BOT_NAME}] Erro no encerramento: ${err.message}`, {
      stack: err.stack
    });
    process.exit(1);
  }
};

['SIGINT', 'SIGTERM'].forEach(signal =>
  process.on(signal, () => gracefulShutdown(signal))
);

(async () => {
  try {
    await connectDatabase();
    await startBot();
  } catch (error) {
    logger.fatal(`[${config.BOT_NAME}] Falha crítica na inicialização: ${error.message}`, {
      stack: error.stack,
    });
    process.exit(1);
  }
})();
