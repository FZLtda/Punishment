require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { loadCommands, loadEvents } = require('./src/utils/loader.js');
const { setPresence } = require('./src/utils/presence.js');
const monitorBot = require('./src/utils/monitoring.js');
const logger = require('./src/utils/logger.js');
const validateEnv = require('./src/utils/validateEnv.js');
const registerSlashCommands = require('./src/utils/loadSlashCommands.js');

// Valida as variáveis de ambiente
validateEnv();

const startTime = Date.now();

// Configuração do cliente Discord com as intenções necessárias
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  
//teste

presence: {
  activity: {
    state: `.help  •  Punishment`,
    name: `.help  •  Punishment`,
    emoji: {
      name: "🔨"
    },
    type: ActivityTypes.CUSTOM_STATUS,
  },
  status: PresenceStatuses.ONLINE,
}
  
// teste
  
});


client.commands = new Collection();
client.slashCommands = new Collection();

(async () => {
  logger.info(`[${process.env.HOSTNAME || 'Punishment'}] Iniciando o bot...`);

  try {
    // Carrega comandos, eventos e registra comandos de barra
    await Promise.all([
      loadCommands(client),
      loadEvents(client),
      registerSlashCommands(client),
    ]);

    // Configura a presença do bot e inicia o monitoramento
    setPresence(client);
    monitorBot(client);

    // Loga no Discord com o token do bot
    await client.login(process.env.TOKEN);

    logger.info(
      `[${process.env.HOSTNAME || 'Punishment'}] Bot pronto em ${
        Date.now() - startTime
      }ms`
    );
  } catch (error) {
    logger.error(
      `[${process.env.HOSTNAME || 'Punishment'}] Falha ao iniciar: ${error.message}`,
      { stack: error.stack }
    );
    process.exit(1);
  }
})();

// Função para lidar com erros e promessas rejeitadas não tratadas
const handleError = (type, error) => {
  logger.error(
    `[${process.env.HOSTNAME || 'Punishment'}] ${type}: ${error.message}`,
    { stack: error.stack }
  );
  process.exit(1);
};

process.on('uncaughtException', (error) => handleError('Erro não tratado', error));
process.on('unhandledRejection', (reason) => handleError('Promessa rejeitada não tratada', reason));
