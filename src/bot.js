'use strict';

const { performance } = require('perf_hooks');
const ExtendedClient = require('./structures/ExtendedClient.js');
const logger = require('./utils/logger.js');
const validateEnv = require('./utils/validateEnv.js');
const { BOT_NAME, MAX_RETRIES, RETRY_DELAY } = require('./config/settings.json');

validateEnv();

let retryCount = 0;
const client = new ExtendedClient();

const startBot = async () => {
  const startTime = performance.now();
  logger.info(`[${BOT_NAME}] Inicializando (Tentativa ${retryCount + 1}/${MAX_RETRIES})`);
  logger.debug(`[${BOT_NAME}] Ambiente: ${process.env.NODE_ENV || 'não especificado'}`);

  try {
    await client.init();
    logger.info(`[${BOT_NAME}] Estruturas carregadas`);
  } catch (err) {
    logger.error(`[${BOT_NAME}] Falha ao carregar estruturas: ${err.message}`, { stack: err.stack });
    return scheduleRetry();
  }

  try {
    await client.login(process.env.TOKEN);
    const elapsed = Math.round(performance.now() - startTime);
    logger.info(`[${BOT_NAME}] Iniciado em ${elapsed}ms`);
    retryCount = 0;
  } catch (err) {
    logger.error(`[${BOT_NAME}] Erro no login: ${err.message}`, { stack: err.stack });
    return scheduleRetry();
  }
};

const scheduleRetry = () => {
  retryCount++;
  if (retryCount < MAX_RETRIES) {
    logger.warn(`[${BOT_NAME}] Nova tentativa em ${RETRY_DELAY / 1000}s (${retryCount}/${MAX_RETRIES})`);
    setTimeout(startBot, RETRY_DELAY);
  } else {
    logger.fatal(`[${BOT_NAME}] Limite de tentativas excedido`);
    process.exit(1);
  }
};

const gracefulShutdown = async (signal) => {
  logger.warn(`[${BOT_NAME}] Encerrando (${signal})`);

  const shutdownTimeout = setTimeout(() => {
    logger.error(`[${BOT_NAME}] Shutdown forçado`);
    process.exit(1);
  }, 10000);

  try {
    await client.destroy();
    clearTimeout(shutdownTimeout);
    logger.info(`[${BOT_NAME}] Recursos liberados`);
    process.exit(0);
  } catch (err) {
    clearTimeout(shutdownTimeout);
    logger.error(`[${BOT_NAME}] Erro ao encerrar: ${err.message}`, { stack: err.stack });
    process.exit(1);
  }
};

['SIGINT', 'SIGTERM'].forEach(signal => {
  process.on(signal, () => gracefulShutdown(signal));
});

process.on('uncaughtException', (err) => {
  logger.fatal(`[${BOT_NAME}] Erro não tratado: ${err.message}`, { stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.fatal(`[${BOT_NAME}] Rejeição não tratada`, { reason, promise });
  process.exit(1);
});

module.exports = startBot;
