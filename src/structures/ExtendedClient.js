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
    this.startTimestamp = Date.now();
    this.version = require('../../package.json').version;
  }

  async init() {
    try {
      await this._loadCore();
      this._attachEvents();
      logger.info(`[${BOT_NAME}] inicialização concluída.`);
    } catch (error) {
      logger.error(`[${BOT_NAME}] erro ao iniciar: ${error.message}`, { stack: error.stack });
      throw error;
    }
  }

  async _loadCore() {
    const withTimeout = (promise, ms, errMsg) =>
      Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error(errMsg)), ms)),
      ]);

    await Promise.all([
      withTimeout(loadCommands(this), 10_000, 'Carregamento de comandos demorou demais'),
      withTimeout(loadEvents(this), 10_000, 'Carregamento de eventos demorou demais'),
    ]);

    setPresence(this);
    monitorBot(this);
  }

  _attachEvents() {
    this.on('disconnect', () =>
      logger.warn(`[${BOT_NAME}] desconectado! Tentando reconectar...`)
    );
    this.on('reconnecting', () =>
      logger.info(`[${BOT_NAME}] tentando reconectar...`)
    );
    this.on('error', (error) =>
      logger.error(`[${BOT_NAME}] erro crítico: ${error.message}`, {
        stack: error.stack,
        timestamp: new Date().toISOString(),
      })
    );
  }
}

module.exports = ExtendedClient;