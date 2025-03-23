require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { loadCommands, loadEvents } = require('./src/utils/loader.js');
const { setPresence } = require('./src/utils/presence.js');
const monitorBot = require('./src/utils/monitoring.js');
const logger = require('./src/utils/logger.js');
const validateEnv = require('./src/utils/validateEnv.js');
const registerSlashCommands = require('./src/utils/loadSlashCommands.js');

// Define uma constante global para o nome do bot
const BOT_NAME = process.env.HOSTNAME || 'Punishment';

// Valida as variáveis de ambiente antes de iniciar
validateEnv();

const startTime = Date.now();
let retryCount = 0; // Contador de tentativas de reinicialização
const MAX_RETRIES = 3; // Número máximo de tentativas

// Configuração do cliente Discord com as intenções necessárias
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  retryLimit: Infinity, // Tenta reconectar indefinidamente
});

client.commands = new Collection();
client.slashCommands = new Collection();

// Função para iniciar o bot com sistema de retry
const startBot = async () => {
  logger.info(`[${BOT_NAME}] Iniciando o bot... (Tentativa ${retryCount + 1})`);

  try {
    // Carrega comandos, eventos e registra comandos de barra
    await Promise.all([loadCommands(client), loadEvents(client), registerSlashCommands(client)]);

    // Configura presença do bot e inicia monitoramento
    setPresence(client);
    monitorBot(client);

    // Loga no Discord com o token do bot
    await client.login(process.env.TOKEN);

    logger.info(`[${BOT_NAME}] Bot pronto em ${Date.now() - startTime}ms`);
    retryCount = 0; // Reseta o contador de tentativas quando inicia com sucesso
  } catch (error) {
    logger.error(`[${BOT_NAME}] Falha ao iniciar: ${error.message}`, { stack: error.stack });

    retryCount++;
    if (retryCount < MAX_RETRIES) {
      logger.warn(`[${BOT_NAME}] Tentando reiniciar em 5 segundos... (${retryCount}/${MAX_RETRIES})`);
      setTimeout(startBot, 5000); // Aguarda 5 segundos antes de tentar novamente
    } else {
      logger.error(`[${BOT_NAME}] Número máximo de tentativas atingido. Encerrando.`);
      process.exit(1);
    }
  }
};

// Lida com desconexões e tenta reconectar automaticamente
client.on('disconnect', () => {
  logger.warn(`[${BOT_NAME}] Bot desconectado! Tentando reconectar...`);
});

client.on('reconnecting', () => {
  logger.info(`[${BOT_NAME}] Tentando reconectar...`);
});

client.on('error', (error) => {
  logger.error(`[${BOT_NAME}] Erro no cliente: ${error.message}`, { stack: error.stack });
});

// Fechamento seguro (Graceful Shutdown)
const gracefulShutdown = async () => {
  logger.warn(`[${BOT_NAME}] Encerrando... Limpando recursos.`);
  await client.destroy(); // Destrói a conexão com o Discord
  logger.info(`[${BOT_NAME}] Bot encerrado com sucesso.`);
  process.exit(0);
};

// Captura sinais de encerramento (Ctrl + C, erro crítico, etc.)
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Lida com erros não tratados e promessas rejeitadas
const handleError = (type, error) => {
  logger.error(`[${BOT_NAME}] ${type}: ${error.message}`, { stack: error.stack });
  process.exit(1);
};

process.on('uncaughtException', (error) => handleError('Erro não tratado', error));
process.on('unhandledRejection', (reason) => handleError('Promessa rejeitada não tratada', reason));

// Inicia o bot
startBot();
