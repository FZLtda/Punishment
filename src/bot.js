const ExtendedClient = require('./structures/ExtendedClient.js');
const logger = require('./utils/logger.js');
const validateEnv = require('./utils/validateEnv.js');
const { BOT_NAME, MAX_RETRIES, RETRY_DELAY } = require('./config/settings.json');

validateEnv();

let retryCount = 0;
const startTime = Date.now();

const client = new ExtendedClient();

const startBot = async () => {
  logger.info(`[${BOT_NAME}] Iniciando o bot... (Tentativa ${retryCount + 1})`);

  try {
    await client.init();

    await client.login(process.env.TOKEN);

    logger.info(`[${BOT_NAME}] Bot pronto em ${Date.now() - startTime}ms`);
    retryCount = 0;
  } catch (error) {
    logger.error(`[${BOT_NAME}] Falha ao iniciar: ${error.message}`, { stack: error.stack });

    retryCount++;
    if (retryCount < MAX_RETRIES) {
      logger.warn(`[${BOT_NAME}] Tentando reiniciar em ${RETRY_DELAY / 1000} segundos... (${retryCount}/${MAX_RETRIES})`);
      setTimeout(startBot, RETRY_DELAY);
    } else {
      logger.error(`[${BOT_NAME}] Número máximo de tentativas atingido. Encerrando.`);
      process.exit(1);
    }
  }
};

const gracefulShutdown = async () => {
  logger.warn(`[${BOT_NAME}] Encerrando... Limpando recursos.`);
  await client.destroy();
  logger.info(`[${BOT_NAME}] Bot encerrado com sucesso.`);
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

module.exports = startBot;
