'use strict';

const { EventEmitter } = require('node:events');
const os = require('os');
const Logger = require('@logger');
const { reportErrorToWebhook } = require('@utils/webhookMonitor');

/**
 * Monitor central de eventos internos do bot, saúde do sistema
 * e alertas críticos. Projetado para ser escalável e robusto.
 */
class Monitor extends EventEmitter {
  constructor() {
    super();

    this.HEARTBEAT_INTERVAL = 1000 * 60 * 5; // 5 minutos

    this._bindEvents();
    this._registerListeners();
    this._startHeartbeat();
  }

  /**
   * Garante que os métodos mantenham o contexto da classe.
   */
  _bindEvents() {
    this.onReady = this.onReady.bind(this);
    this.onCommandUsed = this.onCommandUsed.bind(this);
    this.onError = this.onError.bind(this);
  }

  /**
   * Registra os eventos observados pelo monitor.
   */
  _registerListeners() {
    this.on('ready', this.onReady);
    this.on('commandUsed', this.onCommandUsed);
    this.on('error', this.onError);
  }

  /**
   * Disparado quando o bot fica online.
   * @param {string} tag - Tag do bot
   */
  onReady(tag) {
    Logger.info(`[MONITOR] Bot online: ${tag}`);
    reportErrorToWebhook('Punishment Status', `**${tag}** foi iniciado com sucesso.`);
  }

  /**
   * Disparado quando um comando é usado.
   * @param {{ user: import('discord.js').User, name: string, guild: import('discord.js').Guild }} data
   */
  onCommandUsed({ user, name, guild }) {
    Logger.info(`[CMD] ${user.tag} usou /${name} em ${guild.name}`);
  }

  /**
   * Disparado quando um erro crítico é emitido.
   * @param {string} context - Localização ou tipo de erro
   * @param {Error} error - Objeto do erro
   */
  onError(context, error) {
    const msg = `[ERROR][${context}] ${error.stack || error.message}`;
    Logger.error(msg);
    reportErrorToWebhook(`Erro Crítico: ${context}`, error);
  }

  /**
   * Inicia o heartbeat para registrar estado atual do bot.
   */
  _startHeartbeat() {
    setInterval(() => {
      try {
        if (!global.client) return;

        const mem = this._formatMemory(process.memoryUsage());
        const cpu = this._formatCPU(os.loadavg());
        const uptime = (process.uptime() / 60).toFixed(1);

        const status = [
          `🖥️ Servidores: ${global.client.guilds.cache.size}`,
          `👥 Usuários: ${global.client.users.cache.size}`,
          `⏱️ Uptime: ${uptime} min`,
          `📦 Memória: ${mem}`,
          `⚙️ CPU: ${cpu}`
        ].join('\n');

        this._logHeartbeat(status);
      } catch (err) {
        Logger.warn(`[HEARTBEAT] Falha ao capturar estado do sistema: ${err.message}`);
      }
    }, this.HEARTBEAT_INTERVAL);
  }

  /**
   * Formata os dados de memória.
   * @param {NodeJS.MemoryUsage} mem
   * @returns {string}
   */
  _formatMemory(mem) {
    return `${(mem.rss / 1024 / 1024).toFixed(2)} MB`;
  }

  /**
   * Formata os dados de uso de CPU.
   * @param {[number, number, number]} load
   * @returns {string}
   */
  _formatCPU(load) {
    return load.map(val => val.toFixed(2)).join(' / ') + ' (1m/5m/15m)';
  }

  /**
   * Loga o heartbeat no console.
   * @param {string} info
   */
  _logHeartbeat(info) {
    Logger.debug('[HEARTBEAT] Estado atual do bot:\n' + info);
  }
}

module.exports = new Monitor();
