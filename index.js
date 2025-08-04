'use strict';

require('module-alias/register');
require('dotenv').config();

const { reportErrorToWebhook } = require('@monitors/webhookMonitor');
const bootstrap = require('@core/bootstrap');
const { bot } = require('@config');
const Logger = require('@logger');

const startTime = Date.now();

/**
 * Tratamento global de falhas não capturadas.
 * Garante que erros críticos sejam registrados e enviados ao monitoramento.
 */
process.on('uncaughtException', async (err) => {
  Logger.fatal('uncaughtException:', err);
  await reportErrorToWebhook('uncaughtException', err);
  process.exit(1);
});

process.on('unhandledRejection', async (reason) => {
  Logger.fatal('unhandledRejection:', reason);
  await reportErrorToWebhook('unhandledRejection', reason);
  process.exit(1);
});

/**
 * Encerramento gracioso em sinais do sistema operacional.
 */
['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => {
    Logger.warn(`Sinal recebido: ${signal}`);

    setTimeout(() => {
      Logger.warn('Encerramento forçado após timeout.');
      process.exit(0);
    }, 3000);

    process.exit(0);
  });
});

/**
 * Inicialização principal do Punishment.
 * Responsável por acionar o bootstrap e registrar o tempo de carga.
 */
(async () => {
  try {
    await bootstrap();
    Logger.info(`Inicialização concluída em ${Date.now() - startTime}ms`);
  } catch (error) {
    Logger.fatal(`Falha ao iniciar o ${bot.name}:`, error);
    await reportErrorToWebhook('Erro crítico na inicialização', error);
    process.exit(1);
  }
})();
