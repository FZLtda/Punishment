'use strict';

const Logger = require('@logger');
const { bot } = require('@config');

let shuttingDown = false;
let client = null;
let db = null;

function registerResources(discordClient, mongoConnection) {
  client = discordClient;
  db = mongoConnection;
}

async function gracefulExit(code) {
  if (shuttingDown) return;
  shuttingDown = true;

  try {
    Logger.info(`Encerrando ${bot.name}...`);

    if (client) {
      try {
        await client.destroy();
        Logger.info(`${bot.name} desconectado do Discord.`);
      } catch (err) {
        Logger.error('Erro ao desconectar do Discord:', err);
      }
    }

    if (db) {
      try {
        await db.connection.close();
        Logger.info('Conexão com MongoDB encerrada.');
      } catch (err) {
        Logger.error('Erro ao fechar MongoDB:', err);
      }
    }
  } catch (err) {
    Logger.error('Erro durante o encerramento gracioso:', err);
  } finally {
    Logger.warn(`Processo finalizado com código ${code}`);
    process.exit(code);
  }
}

module.exports = {
  gracefulExit,
  registerResources
};
