'use strict';

require('module-alias/register');
require('dotenv').config();

const { performance } = require('node:perf_hooks');
const v8 = require('v8');

const Logger = require('@logger');
const { bot, env } = require('@config');

const { validateEnvironment } = require('@core/environment');
const bootstrap = require('@core/bootstrap');
const { registerResources, gracefulExit } = require('@core/shutdown');
const { registerGlobalErrorHandlers } = require('@core/errors');
const { registerSignalHandlers } = require('@core/signals');
const Monitor = require('@core/monitor'); 

Object.freeze(bot);

async function main() {
  const startTime = performance.now();

  try {
    validateEnvironment();

    registerGlobalErrorHandlers();

    Logger.info(`[Startup] Iniciando ${bot.name} v${bot.version}`, {
      environment: env,
      node: process.version,
      memoryLimitMB: Math.round(
        v8.getHeapStatistics().heap_size_limit / 1024 / 1024
      )
    });

    const { discordClient, mongo } = await bootstrap();

    if (!discordClient?.destroy) {
      throw new TypeError('[Startup] Discord client inválido recebido.');
    }

    Monitor.setClient(discordClient);

    registerResources({ discordClient, mongo });

    registerSignalHandlers();

    const loadTime = (performance.now() - startTime).toFixed(2);

    Logger.success(`[Startup] ${bot.name} online.`);
    Logger.info(`[Startup] Boot concluído em ${loadTime}ms.`);

    if (process.send) {
      process.send('ready');
    }

  } catch (error) {
    Logger.fatal('[Startup] Falha crítica na inicialização.', {
      message: error.message,
      stack: error.stack
    });

    await gracefulExit(1);
  }
}

main();
