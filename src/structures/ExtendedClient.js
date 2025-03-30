const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { loadCommands, loadEvents } = require('../utils/loader.js');
const { setPresence } = require('../utils/presence.js');
const monitorBot = require('../utils/monitoring.js');
const logger = require('../utils/logger.js');
const { BOT_NAME } = require('../config/settings.json');

class ExtendedClient extends Client {
  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
      ],
      retryLimit: Infinity,
    });

    this.commands = new Collection();
    this.slashCommands = new Collection();
  }

  async init() {
    try {
      await Promise.all([
        loadCommands(this),
        loadEvents(this),
      ]);

      setPresence(this);
      monitorBot(this);

      this.on('disconnect', () => logger.info(`[${BOT_NAME}] desconectado! Tentando reconectar...`));
      this.on('reconnecting', () => logger.info(`[${BOT_NAME}] tentando reconectar...`));
      this.on('error', (error) => logger.info(`[${BOT_NAME}] erro: ${error.message}`, { stack: error.stack }));

      logger.info(`[${BOT_NAME}] inicialização concluída.`);
    } catch (error) {
      logger.info(`[${BOT_NAME}] erro ao iniciar: ${error.message}`, { stack: error.stack });
      throw error;
    }
  }
}

module.exports = ExtendedClient;
