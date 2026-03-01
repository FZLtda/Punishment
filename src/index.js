'use strict';

require('module-alias/register');
require('dotenv').config();

const { performance } = require('node:perf_hooks');
const v8 = require('v8');

const { bot, env } = require('@config');
const Logger = require('@logger');
const bootstrap = require('@core/bootstrap');
const { gracefulExit, registerResources } = require('@core/shutdown');
const { registerGlobalErrorHandlers } = require('@core/errors');
const { registerSignalHandlers } = require('@core/signals');

Object.freeze(bot);

async function main() {
  const startTime = performance.now();

  try {
    registerGlobalErrorHandlers();

    Logger.info(
      `[Main] Iniciando ${bot.name} v${bot.version}...`,
      {
        environment: env,
        nodeVersion: process.version,
        memoryLimit: `${Math.round(
          v8.getHeapStatistics().heap_size_limit / 1024 / 1024
        )}MB`
      }
    );

    const { discordClient, mongo } = await bootstrap();

    if (!discordClient || typeof discordClient.destroy !== 'function') {
      throw new TypeError(
        '[Main] Instância inválida do Discord Client recebida no bootstrap.'
      );
    }

    global.client = discordClient;

    registerResources(discordClient, mongo);

    registerSignalHandlers();

    const loadTime = (performance.now() - startTime).toFixed(2);

    Logger.success(`[Main] ${bot.name} online e operando.`);
    Logger.info(`[Main] Tempo de carregamento: ${loadTime}ms`);

    if (typeof process.send === 'function') {
      process.send('ready');
    }

  } catch (error) {
    Logger.fatal(
      `[Critical] Erro catastrófico na inicialização do ${bot.name}`,
      {
        message: error.message,
        stack: error.stack,
        context: 'Bootstrap'
      }
    );

    await gracefulExit(1);
  }
}

main().catch((err) => {
  console.error('Unhandled Error in Main Exec context:', err);
  process.exit(1);
});
