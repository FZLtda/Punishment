require('dotenv').config();
const logger = require('./src/utils/logger');
const { validateEnv } = require('./src/utils/validateEnv');
const { startBot } = require('./src/core/bot');
const { loadCommands, loadEvents } = require('./src/utils/loader');

validateEnv();

(async () => {
  try {
    logger.info('[Bot] Iniciando o processo de inicialização.');

    await loadCommands();
    await loadEvents();

    await startBot();

    logger.info('[Bot] Processo de inicialização completo.');
  } catch (error) {
    logger.error('[Bot] Erro durante a inicialização do bot: ', { error });
    process.exit(1);
  }
})();
