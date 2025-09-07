'use strict';

/**
 * Entry point do Punishment.
 * Responsável por:
 * - Inicialização principal
 * - Tratamento global de erros
 * - Encerramento gracioso de recursos
 */

require('module-alias/register');
require('dotenv').config();

const { reportErrorToWebhook } = require('@monitors/webhookMonitor');
const bootstrap = require('@core/bootstrap');
const { bot, env } = require('@config');
const Logger = require('@logger');

const startTime = Date.now();
let shuttingDown = false;

let client = null;
let db = null;

process.on('uncaughtException', async (err) => {
  Logger.fatal('[uncaughtException]', err);
  await reportErrorToWebhook('uncaughtException', err);
  await gracefulExit(1);
});

process.on('unhandledRejection', async (reason) => {
  Logger.fatal('[unhandledRejection]', reason);
  await reportErrorToWebhook('unhandledRejection', reason);
  await gracefulExit(1);
});

['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, async () => {
    Logger.warn(`Sinal recebido: ${signal}`);
    await gracefulExit(0);
  });
});

async function gracefulExit(code) {
  if (shuttingDown) return;
  shuttingDown = true;

  try {
    Logger.info(`Encerrando ${bot.name}...`);

    if (client) {
      try {
        await client.destroy();
        Logger.info(`${bot.name} desconectado do Discord.`);
      } catch (err) {
        Logger.error('Erro ao desconectar do Discord:', err);
      }
    }

    if (db) {
      try {
        await db.connection.close();
        Logger.info('Conexão com MongoDB encerrada.');
      } catch (err) {
        Logger.error('Erro ao fechar MongoDB:', err);
      }
    }
  } catch (err) {
    Logger.error('Erro durante o encerramento gracioso:', err);
  } finally {
    Logger.warn(`Processo finalizado com código ${code}`);
    process.exit(code);
  }
}

(async () => {
  try {
    Logger.info(`Iniciando ${bot.name} (ambiente: ${env})...`);

    const { discordClient, mongo } = await bootstrap();
    client = discordClient;
    db = mongo;

    const loadTime = Date.now() - startTime;
    Logger.success(`${bot.name} inicializado em ${loadTime}ms`);
  } catch (error) {
    Logger.fatal(`Falha ao iniciar o ${bot.name}:`, error);
    await reportErrorToWebhook('Erro crítico na inicialização', error);
    await gracefulExit(1);
  }
})();
