'use strict';

require('dotenv').config();
require('module-alias/register');

const os = require('os');
const logger = require('@utils/logger');
const connectDatabase = require('@utils/database');
const startBot = require('@src');
const { BOT_NAME } = require('@config');

(async () => {
  try {
    await connectDatabase();
    await startBot();
  } catch (error) {
    logger.fatal(`[${BOT_NAME}] Falha crítica na inicialização: ${error.message}`, {
      stack: error.stack
    });
    process.exit(1);
  }
})();
