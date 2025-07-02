'use strict';

require('module-alias/register');
require('dotenv').config();

const bootstrap = require('@bot/bootstrap');
const Logger = require('@logger');

// Tratamento global de exceções críticas
process
  .on('uncaughtException', (err) => {
    Logger.fatal(`Erro não capturado (uncaughtException): ${err.stack || err}`);
  })
  .on('unhandledRejection', (reason) => {
    Logger.fatal(`Promessa rejeitada sem tratamento (unhandledRejection): ${reason}`);
  });

// Tratamento de sinais do sistema operacional
['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => {
    Logger.warn(`Sinal recebido (${signal}). Encerrando processo.`);
    process.exit(0);
  });
});

// Processo de inicialização principal
(async () => {
  try {
    Logger.info('Inicializando bootstrap do bot...');
    await bootstrap();
    Logger.info('Bootstrap concluído com êxito. Bot operacional.');
  } catch (error) {
    Logger.fatal(`Erro durante a inicialização do bot: ${error.stack || error}`);
  }
})();
