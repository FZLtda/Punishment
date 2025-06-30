'use strict';

const { performance } = require('perf_hooks');
const ExtendedClient = require('@structures/ExtendedClient');
const validateEnv = require('@utils/validateEnv');
const logger = require('@utils/logger');
const { BOT_NAME, MAX_RETRIES, RETRY_DELAY } = require('@config');

validateEnv();

let retryCount = 0;
const client = new ExtendedClient();

const startBot = async () => {
  const t0 = performance.now();
  logger.debug(`[${BOT_NAME}] startBot() inicializado. Tentativa ${retryCount + 1}/${MAX_RETRIES}`);

  try {
    await client.init();
    await client.login(process.env.TOKEN);

    const elapsed = Math.round(performance.now() - t0);
    logger.debug(`[${BOT_NAME}] Bot autenticado em ${elapsed}ms.`);
    retryCount = 0;
  } catch (err) {
    logger.error(`[${BOT_NAME}] Erro durante boot: ${err.message}`, { stack: err.stack });
    return retryLater();
  }
};

const retryLater = () => {
  retryCount++;

  if (retryCount < MAX_RETRIES) {
    logger.warn(`[${BOT_NAME}] Nova tentativa em ${RETRY_DELAY / 1000}s (${retryCount}/${MAX_RETRIES})`);
    return setTimeout(startBot, RETRY_DELAY);
  }

  logger.fatal(`[${BOT_NAME}] Limite de tentativas excedido. Encerrando processo.`);
  process.exit(1);
};

module.exports = startBot;
