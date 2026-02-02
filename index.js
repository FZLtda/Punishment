'use strict';

require('module-alias/register');
require('dotenv').config();

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
    registerSignalHandlers();

    Logger.info(
      `[Main] Iniciando ${bot.name} v${bot.version || '1.0.0'}...`,
      {
        environment: env,
        nodeVersion: process.version,
        memoryLimit: `${Math.round(
          require('v8').getHeapStatistics().heap_size_limit / 1024 / 1024
        )}MB`
      }
    );

    const resources = await bootstrap();
    registerResources(resources);

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

main().catch(async (err) => {
  console.error('Unhandled Error in Main Exec context:', err);
  process.exit(1);
});
