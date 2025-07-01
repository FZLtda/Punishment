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
    // Validação
    Logger.info('[INIT] Validando variáveis de ambiente...');
    validateEnvironment();

    if (!process.env.TOKEN) {
      Logger.fatal('A variável de ambiente TOKEN está ausente. Verifique o .env.');
      process.exit(1);
    }

    // Banco de dados
    Logger.info('[INIT] Conectando ao MongoDB...');
    await connectMongo();

    // Componentes e recursos
    Logger.info('[INIT] Carregando comandos...');
    await loadCommands(client);

    Logger.info('[INIT] Carregando eventos...');
    await loadEvents(client);

    Logger.info('[INIT] Carregando Slash Commands...');
    await loadSlashCommands(client);

    Logger.info('[INIT] Carregando interações de botões...');
    await loadButtonInteractions(client);

    // Conectando ao Discord
    Logger.info('[INIT] Conectando ao Discord...');
    await client.login(process.env.TOKEN);

    Logger.success('[OK] Punishment inicializado com sucesso!');
  } catch (err) {
    Logger.fatal(`[FATAL] Falha crítica na inicialização: ${err.stack || err.message}`);
    process.exit(1);
  }
};
