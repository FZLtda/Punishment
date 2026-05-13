"use strict";

require("module-alias/register");
require("dotenv").config();

const { performance } = require("node:perf_hooks");
const v8 = require("node:v8");

const Logger = require("@logger");
const { bot, env } = require("@config");

const {
  validateEnvironment,
  registerGlobalErrorHandlers,
  registerSignalHandlers,
  registerResources,
  gracefulExit,
  bootstrap,
  Monitor,
} = require("@core");

Object.freeze(bot);

async function main() {
  const startTime = performance.now();

  try {
    validateEnvironment();
    registerGlobalErrorHandlers();

    const heapLimitMB = Math.round(v8.getHeapStatistics().heap_size_limit / 1024 / 1024);
    
    Logger.info(`[Startup] Iniciando ${bot.name} v${bot.version}`, {
      environment: env,
      node: process.version,
      memoryLimitMB: heapLimitMB
    });

    const { discordClient, mongo } = await bootstrap();

    if (!discordClient?.destroy) {
      throw new TypeError("[Startup] Discord client inválido recebido.");
    }

    Monitor.setClient(discordClient);
    registerResources({ discordClient, mongo });
    registerSignalHandlers();

    const loadTime = (performance.now() - startTime).toFixed(2);

    Logger.success(`[Startup] ${bot.name} online.`);
    Logger.info(`[Startup] Boot concluído em ${loadTime}ms.`);

    if (process.send) {
      process.send("ready");
    }

  } catch (error) {
    Logger.fatal("[Startup] Falha crítica na inicialização.", {
      message: error.message,
      stack: error.stack
    });

    await gracefulExit(1);
  }
}

main();
