'use strict';

const Logger = require('@logger');
const { bot } = require('@config');

let shuttingDown = false;
let resources = {
  discordClient: null,
  mongo: null
};

/**
 * Registra recursos que precisam ser encerrados no shutdown.
 * @param {Object} param0
 * @param {import('discord.js').Client} param0.discordClient
 * @param {Object} param0.mongo
 */
function registerResources({ discordClient, mongo }) {
  resources.discordClient = discordClient ?? null;
  resources.mongo = mongo ?? null;
}

/**
 * Encerra aplicação de forma segura e controlada.
 * @param {number} code Código de saída do processo
 */
async function gracefulExit(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  const SHUTDOWN_TIMEOUT = 10000;

  Logger.warn(`[Shutdown] Encerrando ${bot.name}...`);

  const forceExit = setTimeout(() => {
    Logger.fatal('[Shutdown] Timeout excedido. Encerramento forçado.');
    process.exit(code);
  }, SHUTDOWN_TIMEOUT);

  try {
    
    if (resources.discordClient?.destroy) {
      try {
        await resources.discordClient.destroy();
        Logger.info('[Shutdown] Discord desconectado com sucesso.');
      } catch (err) {
        Logger.error('[Shutdown] Erro ao desconectar Discord.', {
          message: err.message,
          stack: err.stack
        });
      }
    }

    if (resources.mongo?.connection?.close) {
      try {
        await resources.mongo.connection.close();
        Logger.info('[Shutdown] Conexão com MongoDB encerrada.');
      } catch (err) {
        Logger.error('[Shutdown] Erro ao encerrar MongoDB.', {
          message: err.message,
          stack: err.stack
        });
      }
    }

  } catch (err) {
    Logger.error('[Shutdown] Erro inesperado durante encerramento.', {
      message: err.message,
      stack: err.stack
    });
  } finally {
    clearTimeout(forceExit);
    Logger.warn(`[Shutdown] Processo finalizado com código ${code}.`);
    process.exit(code);
  }
}

module.exports = {
  registerResources,
  gracefulExit
};
