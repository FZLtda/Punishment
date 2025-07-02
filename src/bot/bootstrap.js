'use strict';

/**
 * Inicializa todos os sistemas essenciais do bot
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
    // Validação do ambiente
    Logger.info('Validando variáveis de ambiente...');
    validateEnvironment();

    if (!process.env.TOKEN) {
      Logger.fatal('Variável TOKEN ausente. Verifique o arquivo .env.');
      process.exit(1);
    }

    // Conexão com a base de dados
    Logger.info('Estabelecendo conexão com o MongoDB...');
    await connectMongo();

    // Carregamento de estruturas
    Logger.info('Carregando comandos de prefixo...');
    await loadCommands(client);

    Logger.info('Carregando eventos...');
    await loadEvents(client);

    Logger.info('Carregando comandos de barra (slash)...');
    await loadSlashCommands(client);

    Logger.info('Carregando interações de botões...');
    await loadButtonInteractions(client);

    // Autenticação do bot
    Logger.info('Iniciando conexão com a API do Discord...');
    await client.login(process.env.TOKEN);

    Logger.info(`Punishment autenticado com sucesso como ${client.user.tag}`);
  } catch (err) {
    Logger.fatal(`Erro durante o processo de bootstrap: ${err.stack || err.message}`);
    process.exit(1);
  }
};
