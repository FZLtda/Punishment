'use strict';

const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { loadCommands, loadEvents } = require('@utils/loader');
const { setPresence } = require('@utils/presence');
const monitorBot = require('@utils/monitoring');
const logger = require('@utils/logger');
const { BOT_NAME } = require('@config');
const { version } = require('@package.json');

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
    this.version = version;
  }

  async init() {
    try {
      await this.#loadCore();
      this.#attachEvents();
      logger.info(`[${BOT_NAME}] Inicialização concluída.`);
    } catch (err) {
      logger.error(`[${BOT_NAME}] Erro na inicialização: ${err.message}`, { stack: err.stack });
      throw err;
    }
  }

  async #loadCore() {
    const timeout = (promise, ms, msg) =>
      Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error(msg)), ms)),
      ]);

    await Promise.all([
      timeout(loadCommands(this), 10_000, 'Timeout: Carregamento de comandos'),
      timeout(loadEvents(this), 10_000, 'Timeout: Carregamento de eventos'),
    ]);

    setPresence(this);
    monitorBot(this);
  }

  #attachEvents() {
    this.on('disconnect', () =>
      logger.warn(`[${BOT_NAME}] Desconectado. Reconectando...`)
    );

    this.on('reconnecting', () =>
      logger.info(`[${BOT_NAME}] Tentando reconectar...`)
    );

    this.on('error', (err) =>
      logger.error(`[${BOT_NAME}] Erro crítico: ${err.message}`, {
        stack: err.stack,
        timestamp: new Date().toISOString(),
      })
    );
  }
}

module.exports = ExtendedClient;
