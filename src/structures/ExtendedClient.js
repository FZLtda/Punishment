const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { loadCommands, loadEvents } = require('../utils/loader.js');
const { setPresence } = require('../utils/presence.js');
const monitorBot = require('../utils/monitoring.js');
const logger = require('../utils/logger.js');

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

      this.on('disconnect', () => logger.warn(`[BOT] Desconectado! Tentando reconectar...`));
      this.on('reconnecting', () => logger.info(`[BOT] Tentando reconectar...`));
      this.on('error', (error) => logger.error(`[BOT] Erro: ${error.message}`, { stack: error.stack }));

      logger.info('[BOT] Inicialização concluída.');
    } catch (error) {
      logger.error(`[BOT] Erro ao iniciar: ${error.message}`, { stack: error.stack });
      throw error;
    }
  }
}

module.exports = ExtendedClient;
