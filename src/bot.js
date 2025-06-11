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

  logger.info(`[${BOT_NAME}] Inicializando... (Tentativa ${retryCount + 1}/${MAX_RETRIES})`);
  logger.info(`[${BOT_NAME}] Ambiente atual: ${process.env.NODE_ENV || 'não especificado'}`);

  try {
    await client.init();
    logger.info(`[${BOT_NAME}] Estruturas carregadas com sucesso.`);
  } catch (err) {
    logger.error(`[${BOT_NAME}] Falha ao carregar estruturas: ${err.message}`, { stack: err.stack });
    return handleRetry();
  }

  try {
    await client.login(process.env.TOKEN);
    const elapsed = Math.round(performance.now() - startTime);
    logger.info(`[${BOT_NAME}] Iniciado com sucesso em ${elapsed}ms como ${client.user.tag}`);
    retryCount = 0;
  } catch (err) {
    logger.error(`[${BOT_NAME}] Erro no login: ${err.message}`, { stack: err.stack });
    return handleRetry();
  }
};

const handleRetry = () => {
  retryCount++;
  if (retryCount < MAX_RETRIES) {
    logger.warn(`[${BOT_NAME}] Nova tentativa em ${RETRY_DELAY / 1000}s... (${retryCount}/${MAX_RETRIES})`);
    return setTimeout(startBot, RETRY_DELAY);
  }

  logger.fatal(`[${BOT_NAME}] Limite máximo de tentativas atingido. Encerrando processo.`);
  process.exit(1);
};

const gracefulShutdown = async (signal) => {
  logger.warn(`[${BOT_NAME}] Encerramento solicitado (${signal}). Finalizando...`);
  try {
    await client.destroy();
    logger.info(`[${BOT_NAME}] Recursos liberados com sucesso.`);
  } catch (err) {
    logger.error(`[${BOT_NAME}] Erro ao encerrar: ${err.message}`, { stack: err.stack });
  } finally {
    process.exit(0);
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
  logger.fatal(`[${BOT_NAME}] Rejeição não tratada: ${reason}`, { promise });
  process.exit(1);
});

module.exports = startBot;
