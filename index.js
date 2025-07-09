'use strict';

require('module-alias/register');
require('dotenv').config();

const { reportErrorToWebhook } = require('@utils/webhookMonitor');
const bootstrap = require('@bot/bootstrap');
const { bot } = require('@config');
const Logger = require('@logger');

const startTime = Date.now();

// Tratamento global de exceções e sinais
process.on('uncaughtException', async (err) => {
  Logger.fatal('Erro não capturado (uncaughtException):', err);
  await reportErrorToWebhook('Erro não capturado', err);
  process.exit(1);
});

process.on('unhandledRejection', async (reason) => {
  Logger.fatal('Promessa rejeitada sem tratamento (unhandledRejection):', reason);
  await reportErrorToWebhook('Promessa rejeitada', reason);
  process.exit(1);
});

['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => {
    Logger.warn(`Sinal ${signal} recebido. Encerrando...`);

    // Fallback para garantir encerramento
    setTimeout(() => {
      Logger.warn('Encerramento forçado após timeout.');
      process.exit(0);
    }, 3000);

    process.exit(0);
  });
});

(async () => {
  try {
    await bootstrap();
    Logger.info(`Inicialização concluída em ${Date.now() - startTime}ms`);
  } catch (error) {
    Logger.fatal(`Não foi possível inicializar o ${bot.name} :`, error);
    await reportErrorToWebhook('Erro de bootstrap', error);
    process.exit(1);
  }
})();
