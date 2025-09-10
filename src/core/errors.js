'use strict';

const Logger = require('@logger');
const { reportErrorToWebhook } = require('@monitors/webhookMonitor');
const { gracefulExit } = require('@core/shutdown');

function registerGlobalErrorHandlers() {
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
}

module.exports = { registerGlobalErrorHandlers };
