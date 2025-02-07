require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { loadCommands, loadEvents } = require('./src/utils/loader.js');
const { setPresence } = require('./src/utils/presence.js');
const { monitorBot } = require('./src/utils/monitoring.js');
const logger = require('./src/utils/logger.js');

if (!process.env.DISCORD_TOKEN) {
  logger.error('Token do bot não encontrado no arquivo .env');
  process.exit(1);
}

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
  try {
    logger.info('Inicializando o bot...');
    await loadCommands(client);
    await loadEvents(client);
    setPresence(client);
    monitorBot();
    await client.login(process.env.TOKEN);
    logger.info('Bot inicializado com sucesso!');
  } catch (error) {
    logger.error(`Erro ao iniciar o bot: ${error.message}`);
    process.exit(1);
  }
})();

process.on('uncaughtException', (error) => {
  logger.error(`Exceção não tratada: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error(`Promessa rejeitada não tratada: ${reason}`);
});