'use strict';

require('module-alias/register');
require('dotenv').config();

const bootstrap = require('@bot/bootstrap');
const Logger = require('@logger');
const { reportErrorToWebhook } = require('@utils/webhookMonitor');

// Tratamento global de exceções críticas
process
  .on('uncaughtException', (err) => {
    Logger.fatal(`Erro não capturado (uncaughtException): ${err.stack || err}`);
    reportErrorToWebhook('Erro não capturado (uncaughtException)', err);
    process.exit(1);
  })
  .on('unhandledRejection', (reason) => {
    Logger.fatal(`Promessa rejeitada sem tratamento (unhandledRejection): ${reason}`);
    reportErrorToWebhook('Promessa rejeitada sem tratamento (unhandledRejection)', reason);
    process.exit(1);
  });

// Tratamento de sinais do sistema operacional
['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => {
    Logger.warn(`Sinal recebido (${signal}). Encerrando processo...`);
    process.exit(0);
  });
});

// Processo de inicialização principal
(async () => {
  try {
    Logger.info('[BOOT] Inicializando bootstrap do bot...');
    await bootstrap();
    Logger.success('[BOOT] Bootstrap concluído com êxito. Bot operacional.');
  } catch (error) {
    Logger.fatal(`Erro durante a inicialização do bot: ${error.stack || error}`);
    reportErrorToWebhook('Erro na inicialização do bot', error);
    process.exit(1);
  }
})();
