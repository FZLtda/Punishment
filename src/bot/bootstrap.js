const Logger = require('@logger/index');
const client = require('@bot/client');
const { validateEnvironment } = require('@bot/environment');
const { loadCommands } = require('@handlers/commands/loader');
const { loadEvents } = require('@loadEvents/loader');
const { loadSlashCommands } = require('@loadSlashCommands/loader');
const { loadButtonInteractions } = require('@loadButtonInteractions/loader');

module.exports = async function bootstrap() {
  try {
    Logger.info('Validando variáveis de ambiente...');
    validateEnvironment();

    Logger.info('Carregando comandos...');
    await loadCommands(client);

    Logger.info('Carregando eventos...');
    await loadEvents(client);

    Logger.info('Carregando slash commands...');
    await loadSlashCommands(client);

    Logger.info('Carregando interações de botão...');
    await loadButtonInteractions(client);

    Logger.info('Conectando ao Discord...');
    await client.login(process.env.TOKEN);
  } catch (err) {
    Logger.error(`Falha ao inicializar o bot: ${err.message}`);
    process.exit(1);
  }
};
