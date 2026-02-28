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

/**
 * Deep freeze para evitar mutação acidental de config
 */
function deepFreeze(obj) {
  Object.getOwnPropertyNames(obj).forEach((prop) => {
    if (
      obj[prop] !== null &&
      (typeof obj[prop] === 'object' || typeof obj[prop] === 'function')
    ) {
      deepFreeze(obj[prop]);
    }
  });
  return Object.freeze(obj);
}

deepFreeze(bot);

const BOOT_TIMEOUT = 30_000;
let isBootstrapped = false;

async function start() {
  const startTime = performance.now();

  registerGlobalErrorHandlers();

  Logger.info({
    event: 'startup:init',
    bot: bot.name,
    version: bot.version,
    environment: env,
    node: process.version,
    pid: process.pid,
    memoryLimitMB: Math.round(
      v8.getHeapStatistics().heap_size_limit / 1024 / 1024
    )
  });

  try {
    const bootstrapStart = performance.now();

    const { discordClient, mongo } = await Promise.race([
      bootstrap(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Bootstrap timeout exceeded')), BOOT_TIMEOUT)
      )
    ]);

    const bootstrapTime = (performance.now() - bootstrapStart).toFixed(2);

    if (!discordClient?.destroy) {
      throw new TypeError('Invalid Discord client instance returned from bootstrap.');
    }

    // Dependency container
    const container = {
      client: discordClient,
      mongo
    };

    registerResources(container);
    registerSignalHandlers(container);

    registerHealthSystem(container);

    const totalLoadTime = (performance.now() - startTime).toFixed(2);

    isBootstrapped = true;

    Logger.success({
      event: 'startup:complete',
      bot: bot.name,
      bootstrapTime: `${bootstrapTime}ms`,
      totalLoadTime: `${totalLoadTime}ms`
    });

    if (typeof process.send === 'function') {
      process.send('ready');
    }

  } catch (error) {
    Logger.fatal({
      event: 'startup:failure',
      message: error.message,
      stack: error.stack
    });

    process.exitCode = 1;
    await gracefulExit();
  }
}

/**
 * Healthcheck interno para cluster / PM2 / Docker
 */
function registerHealthSystem(container) {
  process.on('message', (msg) => {
    if (msg === 'healthcheck') {
      process.send?.({
        status: isBootstrapped ? 'ok' : 'booting',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        guilds: container.client?.guilds?.cache?.size ?? 0
      });
    }
  });
}

/**
 * Segurança extra contra execução dupla
 */
if (require.main === module) {
  start().catch((err) => {
    Logger.fatal({
      event: 'startup:unhandled',
      message: err.message,
      stack: err.stack
    });

    process.exit(1);
  });
}
