'use strict';

require('module-alias/register');
require('dotenv').config();

const bootstrap = require('@bot/bootstrap');
const Logger = require('@logger');
const { reportErrorToWebhook } = require('@utils/webhookMonitor');

// Tratamento global de exceções
process
  .on('uncaughtException', (err) => {
    Logger.fatal('Erro não capturado (uncaughtException)', err);
    reportErrorToWebhook('Erro não capturado', err);
    process.exit(1);
  })
  .on('unhandledRejection', (reason) => {
    Logger.fatal('Promessa rejeitada sem tratamento (unhandledRejection)', reason);
    reportErrorToWebhook('Promessa rejeitada', reason);
    process.exit(1);
  });

['SIGINT', 'SIGTERM'].forEach((signal) =>
  process.on(signal, () => {
    Logger.warn(`Sinal recebido (${signal}). Encerrando...`);
    process.exit(0);
  })
);

(async () => {
  try {
    await bootstrap();
  } catch (error) {
    Logger.fatal('Erro durante a inicialização do bot', error);
    reportErrorToWebhook('Erro de bootstrap', error);
    process.exit(1);
  }
})();
