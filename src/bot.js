

'use strict';

const { performance } = require('perf_hooks');
const ExtendedClient = require('@structures/ExtendedClient');
const logger = require('@utils/logger');
const validateEnv = require('@utils/validateEnv');
const { BOT_NAME, MAX_RETRIES, RETRY_DELAY } = require('@config/settings');

validateEnv();

let retryCount = 0;
const client = new ExtendedClient();

const startBot = async () => {
  const startTime = performance.now();

  logger.info(`[${BOT_NAME}] Inicializando... (Tentativa ${retryCount + 1}/${MAX_RETRIES})`);
  logger.debug(`[${BOT_NAME}] Ambiente: ${process.env.NODE_ENV || 'não especificado'}`);

  try {
    await client.init();
    logger.info(`[${BOT_NAME}] Estruturas carregadas com sucesso.`);
  } catch (error) {
    logger.error(`[${BOT_NAME}] Falha ao carregar estruturas: ${error.message}`, {
      stack: error.stack,
    });
    return retryLater();
  }

  try {
    await client.login(process.env.TOKEN);
    const elapsed = Math.round(performance.now() - startTime);
    logger.info(`[${BOT_NAME}] Login bem-sucedido. Bot online em ${elapsed}ms.`);
    retryCount = 0;
  } catch (error) {
    logger.error(`[${BOT_NAME}] Erro durante o login: ${error.message}`, {
      stack: error.stack,
    });
    return retryLater();
  }
};

const retryLater = () => {
  retryCount++;

  if (retryCount < MAX_RETRIES) {
    logger.warn(`[${BOT_NAME}] Tentando novamente em ${RETRY_DELAY / 1000}s... (${retryCount}/${MAX_RETRIES})`);
    return setTimeout(startBot, RETRY_DELAY);
  }

  logger.fatal(`[${BOT_NAME}] Número máximo de tentativas excedido. Encerrando processo.`);
  process.exit(1);
};

const gracefulShutdown = async (signal) => {
  logger.warn(`[${BOT_NAME}] Encerramento solicitado (${signal}). Liberando recursos...`);

  const shutdownTimer = setTimeout(() => {
    logger.error(`[${BOT_NAME}] Encerramento forçado após timeout.`);
    process.exit(1);
  }, 10_000);

  try {
    await client.destroy();
    clearTimeout(shutdownTimer);
    logger.info(`[${BOT_NAME}] Recursos liberados com sucesso.`);
    process.exit(0);
  } catch (error) {
    clearTimeout(shutdownTimer);
    logger.error(`[${BOT_NAME}] Erro ao encerrar: ${error.message}`, {
      stack: error.stack,
    });
    process.exit(1);
  }
};

['SIGINT', 'SIGTERM'].forEach(signal => {
  process.on(signal, () => gracefulShutdown(signal));
});

process.on('uncaughtException', (error) => {
  logger.fatal(`[${BOT_NAME}] Erro não tratado: ${error.message}`, {
    stack: error.stack,
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.fatal(`[${BOT_NAME}] Rejeição não tratada: ${reason?.message || reason}`, {
    stack: reason?.stack,
    reason,
  });
  process.exit(1);
});

module.exports = startBot;
