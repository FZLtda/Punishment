const { Client } = require('discord.js');
const logger = require('../utils/logger');
const monitor = require('../utils/monitor');
const { BOT_NAME, MAX_RETRIES } = require('../config/config');
const { setPresence } = require('../utils/presence');

let retryCount = 0;
const startTime = Date.now();

const startBot = async () => {
  const client = new Client({
    intents: [
      'GUILDS',
      'GUILD_MESSAGES',
      'GUILD_MEMBERS',
      'MESSAGE_CONTENT',
    ],
  });

  client.commands = new Map();
  client.slashCommands = new Map();

  setPresence(client);

  monitor(client);

  await retryLogin(client);
  return client;
};

const retryLogin = async (client) => {
  while (retryCount < MAX_RETRIES) {
    try {
      logger.info(`[${BOT_NAME}] Tentando logar no Discord (Tentativa ${retryCount + 1})`);
      await client.login(process.env.TOKEN);

      logger.info(`[${BOT_NAME}] Bot iniciou com sucesso em ${Date.now() - startTime}ms.`);
      return;
    } catch (error) {
      retryCount++;
      logger.error(`[${BOT_NAME}] Falha no login: ${error.message}`);
      if (retryCount < MAX_RETRIES) {
        logger.warn(`[${BOT_NAME}] Tentando reconectar em 5 segundos...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      } else {
        logger.error(`[${BOT_NAME}] Número máximo de tentativas atingido.`);
        process.exit(1);
      }
    }
  }
};

module.exports = { startBot };
