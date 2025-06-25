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

    // Estruturas de comandos
    this.commands = new Collection();
    this.slashCommands = new Collection();
    this.commandMetadata = [];

    // Meta
    this.startTimestamp = Date.now();
    this.version = version;
  }

  /**
   * Inicializa o client: loaders, presença e monitoramento.
   */
  async init() {
    try {
      logger.info(`[${BOT_NAME}] Inicializando bot...`);
      await this.#loadCore();
      this.#attachLifecycleListeners();
      logger.info(`[${BOT_NAME}] Inicialização concluída.`);
    } catch (err) {
      logger.fatal(`[${BOT_NAME}] Falha crítica na inicialização: ${err.message}`, {
        stack: err.stack,
      });
      process.exit(1); // Encerrar processo se init falhar
    }
  }

  /**
   * Carrega comandos, eventos e configura o ambiente do bot.
   */
  async #loadCore() {
    const timeout = (promise, ms, message) =>
      Promise.race([
        promise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`[Timeout] ${message}`)), ms)
        ),
      ]);

    logger.debug('[Core] Carregando comandos e eventos com timeout de 10s...');

    await Promise.all([
      timeout(loadCommands(this), 10_000, 'Carregamento de comandos excedeu o tempo limite.'),
      timeout(loadEvents(this), 10_000, 'Carregamento de eventos excedeu o tempo limite.'),
    ]);

    logger.debug('[Core] Comandos e eventos carregados com sucesso.');

    setPresence(this);
    monitorBot(this);

    logger.debug('[Core] Presença e monitoramento configurados.');
  }

  /**
   * Registra ouvintes para eventos do ciclo de vida do bot.
   */
  #attachLifecycleListeners() {
    this.on('ready', () => {
      logger.info(`[${BOT_NAME}] Online como ${this.user.tag}`);
    });

    this.on('disconnect', () => {
      logger.warn(`[${BOT_NAME}] Desconectado. Tentando reconectar...`);
    });

    this.on('reconnecting', () => {
      logger.info(`[${BOT_NAME}] Reconectando ao Discord...`);
    });

    this.on('shardError', (error, shardId) => {
      logger.error(`[${BOT_NAME}] Erro em shard ${shardId}: ${error.message}`, {
        stack: error.stack,
      });
    });

    this.on('error', (error) => {
      logger.error(`[${BOT_NAME}] Erro inesperado no client: ${error.message}`, {
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
    });

    this.on('warn', (info) => {
      logger.warn(`[${BOT_NAME}] Aviso emitido: ${info}`);
    });
  }
}

module.exports = ExtendedClient;
