'use strict';

/**
 * Inicializa todos os sistemas necessários do bot
 * @async
 * @function bootstrap
 * @returns {Promise<void>}
 */

const Logger = require('@logger');
const client = require('@bot/client');
const { validateEnvironment } = require('@bot/environment');
const { connectMongo } = require('@database');
const { loadCommands } = require('@loadCommands/loader');
const { loadEvents } = require('@loadEvents/loader');
const { loadSlashCommands } = require('@loadSlashCommands/loader');
const { loadButtonInteractions } = require('@loadButtonInteractions/loader');

module.exports = async function bootstrap() {
  try {
    Logger.info('Validando variáveis de ambiente...');
    validateEnvironment();

    Logger.info('Conectando ao MongoDB...');
    await connectMongo();

    Logger.info('Carregando comandos...');
    await loadCommands(client);

    Logger.info('Carregando eventos...');
    await loadEvents(client);

    Logger.info('Carregando Slash Commands...');
    await loadSlashCommands(client);

    Logger.info('Carregando interações de botões...');
    await loadButtonInteractions(client);

    Logger.info('Conectando ao Discord...');
    await client.login(process.env.TOKEN);

    Logger.success('Punishment inicializado com sucesso!');
  } catch (err) {
    Logger.fatal(`Falha crítica na inicialização: ${err.stack || err.message}`);
    process.exit(1);
  }
};
