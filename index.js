import 'dotenv/config';
import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { loadCommands, loadEvents } from './src/utils/loader.js';
import { setPresence } from './src/utils/presence.js';
import { monitorBot } from './src/utils/monitoring.js';
import logger from './src/utils/logger.js';
import validateEnv from './src/utils/validateEnv.js';

validateEnv();

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

export default function validateEnv() {
  const requiredVars = ['TOKEN'];
  const missingVars = requiredVars.filter((key) => !process.env[key]);

  if (missingVars.length > 0) {
    logger.error(`Variáveis de ambiente ausentes: ${missingVars.join(', ')}`);
    process.exit(1);
  }
}