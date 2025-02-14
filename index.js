require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { loadCommands, loadEvents } = require('./src/utils/loader.js');
const { setPresence } = require('./src/utils/presence.js');
const monitorBot = require('./src/utils/monitoring.js');
const logger = require('./src/utils/logger.js');
const validateEnv = require('./src/utils/validateEnv.js');
const registerSlashCommands = require('./src/utils/loadSlashCommands.js');

validateEnv();

const startTime = Date.now();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();
client.slashCommands = new Collection();

(async () => {
  logger.info(`[${process.env.HOSTNAME || 'Punishment'}] Iniciando o bot...`);

  try {
  
    await Promise.all([
      loadCommands(client),
      loadEvents(client),
      registerSlashCommands(client),
    ]);

    setPresence(client);
    monitorBot(client);

    await client.login(process.env.TOKEN);

    logger.info(
      `[${process.env.HOSTNAME || 'Punishment'}] Bot pronto em ${
        Date.now() - startTime
      }ms`
    );
  } catch (error) {
    logger.error(
      `[${process.env.HOSTNAME || 'Punishment'}] Falha ao iniciar: ${error.message}`
    );
    process.exit(1);
  }
})();

const handleError = (type, error) => {
  logger.error(
    `[${process.env.HOSTNAME || 'Punishment'}] ${type}: ${error.message}`
  );
  process.exit(1);
};

process.on('uncaughtException', (error) => handleError('Erro não tratado', error));
process.on('unhandledRejection', (reason) => handleError('Promessa rejeitada não tratada', reason));