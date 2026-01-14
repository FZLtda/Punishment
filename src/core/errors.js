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
    Logger.error('[unhandledRejection]', reason);
    await reportErrorToWebhook('unhandledRejection', reason);

  });
}

module.exports = { registerGlobalErrorHandlers };
