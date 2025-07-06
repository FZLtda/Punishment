'use strict';

const { EventEmitter } = require('node:events');
const os = require('os');
const Logger = require('@logger');
const { bot } = require('@config');
const { reportErrorToWebhook } = require('@utils/webhookMonitor');

/**
 * Central de Monitoramento — núcleo de observabilidade e diagnósticos do sistema.
 * Gerencia eventos internos do bot e mantém métricas críticas para análise e resposta.
 */
class Monitor extends EventEmitter {
  constructor() {
    super();

    this.HEARTBEAT_INTERVAL = 1000 * 60 * 5; // 5 minutos
    this.eventHandlers = new Map();

    this._bindHandlers();
    this._registerDefaultListeners();
    this._startHeartbeat();
  }

  /**
   * Liga os métodos ao contexto da classe.
   */
  _bindHandlers() {
    this.handleReady = this.handleReady.bind(this);
    this.handleCommandUsed = this.handleCommandUsed.bind(this);
    this.handleError = this.handleError.bind(this);
  }

  /**
   * Registra os ouvintes padrão do monitor.
   */
  _registerDefaultListeners() {
    this.on('ready', this.handleReady);
    this.on('commandUsed', this.handleCommandUsed);
    this.on('error', this.handleError);

    // Permite extensibilidade futura
    this.eventHandlers.set('ready', this.handleReady);
    this.eventHandlers.set('commandUsed', this.handleCommandUsed);
    this.eventHandlers.set('error', this.handleError);
  }

  /**
   * Manipula o evento 'ready'
   * @param {string} tag
   */
  handleReady(tag) {
    Logger.info(`[STATUS] ${bot.name} está online: ${tag}`);
    reportErrorToWebhook(`${bot.name} Status`, `**${tag}** foi iniciado com sucesso.`);
  }

  /**
   * Manipula eventos de uso de comandos
   * @param {{ user: import('discord.js').User, name: string, guild: import('discord.js').Guild }} data
   */
  handleCommandUsed({ user, name, guild }) {
    Logger.info(`[CMD] ${user.tag} usou /${name} em ${guild.name} (${guild.id})`);
  }

  /**
   * Manipula erros críticos
   * @param {string} context
   * @param {Error} error
   */
  handleError(context, error) {
    const trace = `[MONITOR][ERROR][${context}] ${error.stack || error.message}`;
    Logger.error(trace);
    reportErrorToWebhook(`Erro Crítico: ${context}`, error);
  }

  /**
   * Dispara heartbeat com métricas do sistema
   */
  _startHeartbeat() {
    setInterval(() => {
      try {
        if (!global.client) return;

        const guilds = global.client.guilds.cache.size;
        const users = global.client.users.cache.size;
        const uptime = (process.uptime() / 60).toFixed(1);
        const mem = this._formatMemory(process.memoryUsage());
        const cpu = this._formatCPU(os.loadavg());

        const heartbeat = [
          `🖥️ Servidores: ${guilds}`,
          `👥 Usuários: ${users}`,
          `⏱️ Uptime: ${uptime} min`,
          `📦 Memória: ${mem}`,
          `⚙️ CPU: ${cpu}`,
        ].join('\n');

        this._logHeartbeat(heartbeat);
      } catch (err) {
        Logger.warn(`[MONITOR][HEARTBEAT] Falha ao registrar estado: ${err.message}`);
      }
    }, this.HEARTBEAT_INTERVAL);
  }

  /**
   * Formata os dados de memória
   * @param {NodeJS.MemoryUsage} mem
   * @returns {string}
   */
  _formatMemory(mem) {
    const rss = (mem.rss / 1024 / 1024).toFixed(2);
    const heapUsed = (mem.heapUsed / 1024 / 1024).toFixed(2);
    return `${rss} MB (RSS), ${heapUsed} MB (Heap)`;
  }

  /**
   * Formata os dados de carga do CPU
   * @param {[number, number, number]} load
   * @returns {string}
   */
  _formatCPU(load) {
    return load.map(l => l.toFixed(2)).join(' / ') + ' (1m/5m/15m)';
  }

  /**
   * Exibe log do estado atual
   * @param {string} message
   */
  _logHeartbeat(message) {
    Logger.debug(`[MONITOR][HEARTBEAT]\n${message}`);
  }

  /**
   * Permite registrar novos eventos dinamicamente
   * @param {string} eventName
   * @param {(...args: any[]) => void} handler
   */
  registerEvent(eventName, handler) {
    if (typeof handler !== 'function') {
      throw new TypeError(`Handler para evento '${eventName}' deve ser uma função.`);
    }

    this.on(eventName, handler);
    this.eventHandlers.set(eventName, handler);
    Logger.info(`[MONITOR] Registrado handler para evento '${eventName}'`);
  }

  /**
   * Permite emitir eventos de forma centralizada e segura
   * @param {string} eventName
   * @param  {...any} args
   */
  emitEvent(eventName, ...args) {
    if (!this.eventHandlers.has(eventName)) {
      Logger.warn(`[MONITOR] Evento '${eventName}' emitido mas não possui handler registrado.`);
    }

    this.emit(eventName, ...args);
  }
}

module.exports = new Monitor();
