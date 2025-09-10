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

const bootstrap = require('@core/bootstrap');
const { bot, env } = require('@config');
const Logger = require('@logger');

const { gracefulExit, registerResources } = require('@core/shutdown');
const { registerGlobalErrorHandlers } = require('@core/errors');
const { registerSignalHandlers } = require('@core/signals');

const startTime = Date.now();

registerGlobalErrorHandlers();
registerSignalHandlers();

(async () => {
  try {
    Logger.info(`Iniciando ${bot.name} (ambiente: ${env})...`);

    const { discordClient, mongo } = await bootstrap();
    registerResources(discordClient, mongo);

    const loadTime = Date.now() - startTime;
    Logger.success(`${bot.name} inicializado em ${loadTime}ms`);
  } catch (error) {
    Logger.fatal(`Falha ao iniciar o ${bot.name}:`, error);
    await gracefulExit(1);
  }
})();
