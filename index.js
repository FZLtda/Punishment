require('dotenv').config();

const logger = require('./src/utils/logger.js');

const startBot = require('./src/bot.js');

process.on('uncaughtException', (error) => {
  logger.error(`Erro não tratado: ${error.message}`, { stack: error.stack });
  process.exit(1); 
});

process.on('unhandledRejection', (reason) => {
  logger.error(`Promessa rejeitada não tratada: ${reason}`);
  process.exit(1);
});

startBot();
