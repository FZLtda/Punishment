'use strict';

const { EventEmitter } = require('node:events');
const os = require('os');
const Logger = require('@logger');
const { reportErrorToWebhook } = require('@utils/webhookMonitor');

/**
 * Monitor global de eventos críticos e operacionais do sistema.
 * Utiliza EventEmitter para emitir e reagir a eventos internos do bot.
 */
class Monitor extends EventEmitter {
  constructor() {
    super();

    this.registerListeners();
    this.startHeartbeat();
  }

  /**
   * Registra os eventos internos que o monitor irá observar.
   */
  registerListeners() {
    this.on('ready', this.onReady);
    this.on('commandUsed', this.onCommandUsed);
    this.on('error', this.onError);
  }

  /**
   * Evento disparado quando o bot fica online.
   * @param {string} tag - Tag do bot conectado
   */
  onReady(tag) {
    Logger.success(`[MONITOR] Bot online como ${tag}`);
    reportErrorToWebhook('🟢 Punishment Online', `Bot conectado como \`${tag}\``);
  }

  /**
   * Evento disparado ao usar um comando.
   * @param {{ user: import('discord.js').User, name: string, guild: import('discord.js').Guild }} data
   */
  onCommandUsed({ user, name, guild }) {
    Logger.info(`[CMD] ${user.tag} usou /${name} em ${guild.name}`);
  }

  /**
   * Evento disparado quando um erro crítico ocorre.
   * @param {string} context - Contexto do erro
   * @param {Error} error - Objeto de erro capturado
   */
  onError(context, error) {
    const message = `[ERROR][${context}] ${error.stack || error.message}`;
    Logger.error(message);
    reportErrorToWebhook(`Erro crítico: ${context}`, error);
  }

  /**
   * Inicia o monitoramento contínuo da saúde do processo.
   */
  startHeartbeat() {
    setInterval(() => {
      if (!global.client) return;

      const mem = process.memoryUsage();
      const usage = [
        `- Servidores: ${global.client.guilds.cache.size}`,
        `- Usuários: ${global.client.users.cache.size}`,
        `- Uptime: ${(process.uptime() / 60).toFixed(1)} min`,
        `- RAM: ${(mem.rss / 1024 / 1024).toFixed(2)} MB`,
        `- CPU: ${os.loadavg().map(x => x.toFixed(2)).join(' / ')} (1/5/15m)`
      ].join('\n');

      Logger.debug('[HEARTBEAT] Estado atual do bot:\n' + usage);
    }, 1000 * 60 * 5);
  }
}

module.exports = new Monitor();
