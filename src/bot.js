'use strict';

const { performance } = require('perf_hooks');
const ExtendedClient = require('@structures/ExtendedClient');
const logger = require('@utils/logger');
const validateEnv = require('@utils/validateEnv');
const settings = require('@config');

validateEnv();

let retryCount = 0;
const client = new ExtendedClient();

const startBot = async () => {
  const startTime = performance.now();

  logger.info(`[${settings.BOT_NAME}] Inicializando (Tentativa ${retryCount + 1}/${settings.MAX_RETRIES})`);
  logger.debug(`[${settings.BOT_NAME}] Ambiente: ${process.env.NODE_ENV || 'não especificado'}`);

  try {
    await client.init();
    logger.info(`[${settings.BOT_NAME}] Estruturas carregadas`);
  } catch (err) {
    logger.error(`[${settings.BOT_NAME}] Falha ao carregar estruturas: ${err.message}`, {
      stack: err.stack
    });
    return scheduleRetry();
  }

  try {
    await client.login(process.env.TOKEN);
    const elapsed = Math.round(performance.now() - startTime);
    logger.info(`[${settings.BOT_NAME}] Iniciado em ${elapsed}ms`);
    retryCount = 0;
  } catch (err) {
    logger.error(`[${settings.BOT_NAME}] Erro no login: ${err.message}`, {
      stack: err.stack
    });
    return scheduleRetry();
  }
};

const scheduleRetry = () => {
  retryCount++;

  if (retryCount < settings.MAX_RETRIES) {
    logger.warn(`[${settings.BOT_NAME}] Nova tentativa em ${settings.RETRY_DELAY / 1000}s (${retryCount}/${settings.MAX_RETRIES})`);
    return setTimeout(startBot, settings.RETRY_DELAY);
  }

  logger.fatal(`[${settings.BOT_NAME}] Limite de tentativas excedido`);
  process.exit(1);
};

const gracefulShutdown = async (signal) => {
  logger.warn(`[${settings.BOT_NAME}] Encerrando (${signal})`);

  const shutdownTimeout = setTimeout(() => {
    logger.error(`[${settings.BOT_NAME}] Shutdown forçado`);
    process.exit(1);
  }, 10000);

  try {
    await client.destroy();
    clearTimeout(shutdownTimeout);
    logger.info(`[${settings.BOT_NAME}] Recursos liberados`);
    process.exit(0);
  } catch (err) {
    clearTimeout(shutdownTimeout);
    logger.error(`[${settings.BOT_NAME}] Erro ao encerrar: ${err.message}`, {
      stack: err.stack
    });
    process.exit(1);
  }
};

['SIGINT', 'SIGTERM'].forEach(signal => {
  process.on(signal, () => gracefulShutdown(signal));
});

process.on('uncaughtException', (err) => {
  logger.fatal(`[${settings.BOT_NAME}] Erro não tratado: ${err.message}`, {
    stack: err.stack
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.fatal(`[${settings.BOT_NAME}] Rejeição não tratada`, {
    reason,
    promise
  });
  process.exit(1);
});

module.exports = startBot;
