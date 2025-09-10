'use strict';

const Logger = require('@logger');
const { gracefulExit } = require('@core/shutdown');

function registerSignalHandlers() {
  ['SIGINT', 'SIGTERM'].forEach((signal) => {
    process.on(signal, async () => {
      Logger.warn(`Sinal recebido: ${signal}`);
      await gracefulExit(0);
    });
  });
}

module.exports = { registerSignalHandlers };
