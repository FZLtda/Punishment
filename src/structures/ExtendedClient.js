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
        GatewayIntentBits.GuildMembers
      ]
    });

    this.commands = new Collection();
    this.slashCommands = new Collection();
    this.commandMetadata = [];

    this.version = version;
    this.startTimestamp = Date.now();
  }

  /**
   * Inicializa o bot (loaders, listeners, monitoramento).
   */
  async init() {
    await this.#loadCore();
    this.#attachLifecycleListeners();
  }

  /**
   * Carrega comandos/eventos e configura runtime.
   */
  async #loadCore() {
    const timeout = (promise, ms, label) =>
      Promise.race([
        promise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`[Timeout] ${label}`)), ms)
        )
      ]);

    logger.debug('[Core] Carregando estruturas...');

    await Promise.all([
      timeout(loadCommands(this), 10_000, 'Carregamento de comandos'),
      timeout(loadEvents(this), 10_000, 'Carregamento de eventos')
    ]);

    setPresence(this);
    monitorBot(this);

    logger.debug('[Core] Ambiente do bot pronto.');
  }

  /**
   * Eventos fundamentais de ciclo de vida.
   */
  #attachLifecycleListeners() {
    this.on('ready', () => {
      const uptime = Math.round((Date.now() - this.startTimestamp) / 1000);
      logger.info(`[${BOT_NAME}] está online como ${this.user.tag} — uptime: ${uptime}s`);
    });

    this.on('disconnect', () => {
      logger.warn(`[${BOT_NAME}] Desconectado — reconectando...`);
    });

    this.on('reconnecting', () => {
      logger.info(`[${BOT_NAME}] Reconectando...`);
    });

    this.on('shardError', (err, shardId) => {
      logger.error(`[${BOT_NAME}] Erro em shard ${shardId}: ${err.message}`, { stack: err.stack });
    });

    this.on('error', (err) => {
      logger.error(`[${BOT_NAME}] Erro no client: ${err.message}`, {
        stack: err.stack,
        timestamp: new Date().toISOString()
      });
    });

    this.on('warn', (msg) => {
      logger.warn(`[${BOT_NAME}] Aviso do Discord: ${msg}`);
    });
  }
}

module.exports = ExtendedClient;
