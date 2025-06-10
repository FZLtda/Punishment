const { performance } = require('perf_hooks');
const ExtendedClient = require('./structures/ExtendedClient.js');
const logger = require('./utils/logger.js');
const validateEnv = require('./utils/validateEnv.js');
const { BOT_NAME, MAX_RETRIES, RETRY_DELAY } = require('./config/settings.json');

validateEnv();

let retryCount = 0;
const client = new ExtendedClient();

const logSeparator = () => logger.info('='.repeat(60));

const startBot = async () => {
  const startTime = performance.now();
  logSeparator();
  logger.info(`[${BOT_NAME}] Inicializando... Tentativa ${retryCount + 1}`);
  logger.info(`Ambiente: ${process.env.NODE_ENV || 'desconhecido'}`);

  try {
    await client.init();
    logger.info(`[${BOT_NAME}] Estruturas carregadas com sucesso.`);
  } catch (error) {
    logger.error(`[${BOT_NAME}] Erro ao inicializar estruturas: ${error.message}`, {
      stack: error.stack,
    });
    return handleRetry();
  }

  try {
    await client.login(process.env.TOKEN);
    const elapsed = Math.round(performance.now() - startTime);
    logger.info(`[${BOT_NAME}] Pronto! Inicialização em ${elapsed}ms`);
    retryCount = 0;
    logSeparator();
  } catch (error) {
    logger.error(`[${BOT_NAME}] Falha ao fazer login: ${error.message}`, {
      stack: error.stack,
    });
    return handleRetry();
  }
};

const handleRetry = () => {
  retryCount++;
  if (retryCount < MAX_RETRIES) {
    logger.warn(`[${BOT_NAME}] Tentando novamente em ${RETRY_DELAY / 1000}s... (${retryCount}/${MAX_RETRIES})`);
    setTimeout(startBot, RETRY_DELAY);
  } else {
    logger.fatal(`[${BOT_NAME}] Máximo de tentativas atingido. Encerrando processo.`);
    process.exit(1);
  }
};

const gracefulShutdown = async (signal) => {
  logger.warn(`[${BOT_NAME}] Encerramento iniciado via ${signal}. Limpando recursos...`);
  try {
    await client.destroy();
    logger.info(`[${BOT_NAME}] Encerrado com sucesso.`);
  } catch (err) {
    logger.error(`[${BOT_NAME}] Erro ao encerrar: ${err.message}`, {
      stack: err.stack,
    });
  } finally {
    logSeparator();
    process.exit(0);
  }
};

['SIGINT', 'SIGTERM'].forEach(signal =>
  process.on(signal, () => gracefulShutdown(signal))
);

process.on('uncaughtException', (err) => {
  logger.fatal(`[${BOT_NAME}] Erro não tratado: ${err.message}`, { stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.fatal(`[${BOT_NAME}] Rejeição não tratada: ${reason}`, { promise });
  process.exit(1);
});

module.exports = startBot;
