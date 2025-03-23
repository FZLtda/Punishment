require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { loadCommands, loadEvents } = require('./src/utils/loader.js');
const { setPresence } = require('./src/utils/presence.js');
const monitorBot = require('./src/utils/monitoring.js');
const logger = require('./src/utils/logger.js');
const validateEnv = require('./src/utils/validateEnv.js');
const registerSlashCommands = require('./src/utils/loadSlashCommands.js');


const BOT_NAME = process.env.HOSTNAME || 'Punishment';


validateEnv();

const startTime = Date.now();
let retryCount = 0; 
const MAX_RETRIES = 3; 


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  retryLimit: Infinity,
});

client.commands = new Collection();
client.slashCommands = new Collection();


const startBot = async () => {
  logger.info(`[${BOT_NAME}] Iniciando o bot... (Tentativa ${retryCount + 1})`);

  try {
    
    await Promise.all([loadCommands(client), loadEvents(client), registerSlashCommands(client)]);

    
    setPresence(client);
    monitorBot(client);

    
    await client.login(process.env.TOKEN);

    logger.info(`[${BOT_NAME}] Bot pronto em ${Date.now() - startTime}ms`);
    retryCount = 0; 
  } catch (error) {
    logger.error(`[${BOT_NAME}] Falha ao iniciar: ${error.message}`, { stack: error.stack });

    retryCount++;
    if (retryCount < MAX_RETRIES) {
      logger.warn(`[${BOT_NAME}] Tentando reiniciar em 5 segundos... (${retryCount}/${MAX_RETRIES})`);
      setTimeout(startBot, 5000); 
    } else {
      logger.error(`[${BOT_NAME}] Número máximo de tentativas atingido. Encerrando.`);
      process.exit(1);
    }
  }
};


client.on('disconnect', () => {
  logger.warn(`[${BOT_NAME}] Bot desconectado! Tentando reconectar...`);
});

client.on('reconnecting', () => {
  logger.info(`[${BOT_NAME}] Tentando reconectar...`);
});

client.on('error', (error) => {
  logger.error(`[${BOT_NAME}] Erro no cliente: ${error.message}`, { stack: error.stack });
});


const gracefulShutdown = async () => {
  logger.warn(`[${BOT_NAME}] Encerrando... Limpando recursos.`);
  await client.destroy();
  logger.info(`[${BOT_NAME}] Bot encerrado com sucesso.`);
  process.exit(0);
};


process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);


const handleError = (type, error) => {
  logger.error(`[${BOT_NAME}] ${type}: ${error.message}`, { stack: error.stack });
  process.exit(1);
};

process.on('uncaughtException', (error) => handleError('Erro não tratado', error));
process.on('unhandledRejection', (reason) => handleError('Promessa rejeitada não tratada', reason));

startBot();
