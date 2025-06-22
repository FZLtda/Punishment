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
    });

    this.commands = new Collection();
    this.slashCommands = new Collection();
    this.startTimestamp = Date.now();
    this.version = version;
  }

  async init() {
    try {
      logger.info(`[${BOT_NAME}] Iniciando o carregamento das estruturas...`);
      await this.#loadCore();
      this.#attachLifecycleListeners();
      logger.info(`[${BOT_NAME}] Inicialização concluída.`);
    } catch (error) {
      logger.error(`[${BOT_NAME}] Falha na inicialização: ${error.message}`, {
        stack: error.stack,
      });
      throw error;
    }
  }

  async #loadCore() {
    const timeout = (promise, ms, errorMessage) =>
      Promise.race([
        promise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(errorMessage)), ms)
        ),
      ]);

    await Promise.all([
      timeout(loadCommands(this), 10_000, 'Timeout ao carregar comandos.'),
      timeout(loadEvents(this), 10_000, 'Timeout ao carregar eventos.'),
    ]);

    setPresence(this);
    monitorBot(this);
  }

  #attachLifecycleListeners() {
    this.on('disconnect', () => {
      logger.warn(`[${BOT_NAME}] Bot desconectado. Tentando reconectar...`);
    });

    this.on('reconnecting', () => {
      logger.info(`[${BOT_NAME}] Reconectando...`);
    });

    this.on('error', (error) => {
      logger.error(`[${BOT_NAME}] Erro inesperado: ${error.message}`, {
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
    });
  }
}

module.exports = ExtendedClient;
