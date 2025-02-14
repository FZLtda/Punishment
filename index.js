require('dotenv').config();
const { Client, GatewayIntentBits, Collection, ShardingManager } = require('discord.js');
const { loadCommands, loadEvents } = require('./src/utils/loader.js');
const { setPresence } = require('./src/utils/presence.js');
const monitorBot = require('./src/utils/monitoring.js');
const logger = require('./src/utils/logger.js');
const validateEnv = require('./src/utils/validateEnv.js');
const registerSlashCommands = require('./src/utils/loadSlashCommands.js');

validateEnv();

const manager = new ShardingManager('./bot.js', {
  token: process.env.TOKEN,
  totalShards: 'auto',
  respawn: true,
});

manager.on('shardCreate', (shard) => {
  logger.info(`Shard ${shard.id} iniciada com sucesso.`);
});

manager.spawn();

const initializeBot = async () => {
  try {
    logger.info('🔹 Iniciando o bot...');
    
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

    await loadCommands(client);
    await loadEvents(client);
    setPresence(client);
    monitorBot(client);
    await registerSlashCommands(client);

    await client.login(process.env.TOKEN);
    logger.info('Bot inicializado com sucesso!');
    
    return client;
  } catch (error) {
    logger.error(`Erro crítico ao iniciar o bot: ${error.stack || error.message}`);
    process.exit(1);
  }
};

initializeBot();

process.on('uncaughtException', (error) => {
  logger.error(`Exceção não tratada: ${error.stack || error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error(`Promessa rejeitada não tratada: ${reason}`);
});