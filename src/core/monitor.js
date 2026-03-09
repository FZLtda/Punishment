'use strict';

const { EventEmitter } = require('node:events');
const os = require('os');
const axios = require('axios');
const mongoose = require('mongoose');
const Logger = require('@logger');
const { bot } = require('@config');
const { reportErrorToWebhook } = require('@monitors/webhookMonitor');

class Monitor extends EventEmitter {
  constructor() {
    super();

    this.INTERNAL_HEARTBEAT_INTERVAL = 1000 * 60 * 5;
    this.EXTERNAL_HEARTBEAT_INTERVAL = 1000 * 55;
    
    this.eventHandlers = new Map();

    this._bindHandlers();
    this._registerDefaultListeners();
    this._startInternalHeartbeat();
    this._startExternalHeartbeats();
  }

  _bindHandlers() {
    this.handleReady = this.handleReady.bind(this);
    this.handleCommandUsed = this.handleCommandUsed.bind(this);
    this.handleError = this.handleError.bind(this);
  }

  _registerDefaultListeners() {
    this.on('ready', this.handleReady);
    this.on('commandUsed', this.handleCommandUsed);
    this.on('error', this.handleError);

    this.eventHandlers.set('ready', this.handleReady);
    this.eventHandlers.set('commandUsed', this.handleCommandUsed);
    this.eventHandlers.set('error', this.handleError);
  }

  handleReady(tag) {
    Logger.info(`[STATUS] ${bot.name} está online: ${tag}`);
    reportErrorToWebhook(`${bot.name} Status`, `**${tag}** foi iniciado com sucesso.`);
  }

  handleCommandUsed({ user, name, guild }) {
    Logger.info(`[CMD] ${user.tag} usou /${name} em ${guild.name} (${guild.id})`);
  }

  handleError(context, error) {
    const trace = `[MONITOR][ERROR][${context}] ${error.stack || error.message}`;
    Logger.error(trace);
    reportErrorToWebhook(`Erro Crítico: ${context}`, error);
  }

  /**
   * Monitoramento Externo (Better Stack)
   * Envia batimentos para o Bot, Database e Command Handler
   */
  _startExternalHeartbeats() {
    const { HB_BOT, HB_DB, HB_HANDLER } = process.env;

    if (!HB_BOT || !HB_DB || !HB_HANDLER) {
      return Logger.warn('[MONITOR][EXTERNAL] URLs de Heartbeat (Bot, DB ou Handler) ausentes no .env.');
    }

    setInterval(async () => {
      try {
        // Sinal de vida do Bot (Presença básica)
        await axios.get(HB_BOT);

        // Sinal de vida da Database (Conexão ativa)
        if (mongoose.connection.readyState === 1) {
          await axios.get(HB_DB);
        }

        // Sinal de vida do Command Handler (Comandos carregados)
        if (global.client?.commands?.size > 0) {
          await axios.get(HB_HANDLER);
        }
      } catch (err) {
        Logger.debug(`[MONITOR][EXTERNAL] Falha no sinal externo: ${err.message}`);
      }
    }, this.EXTERNAL_HEARTBEAT_INTERVAL);
  }

  /**
   * Monitoramento Interno (Métricas de Sistema)
   */
  _startInternalHeartbeat() {
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
        Logger.warn(`[MONITOR][INTERNAL] Falha ao registrar estado: ${err.message}`);
      }
    }, this.INTERNAL_HEARTBEAT_INTERVAL);
  }

  _formatMemory(mem) {
    const rss = (mem.rss / 1024 / 1024).toFixed(2);
    const heapUsed = (mem.heapUsed / 1024 / 1024).toFixed(2);
    return `${rss} MB (RSS), ${heapUsed} MB (Heap)`;
  }

  _formatCPU(load) {
    return load.map(l => l.toFixed(2)).join(' / ') + ' (1m/5m/15m)';
  }

  _logHeartbeat(message) {
    Logger.debug(`[MONITOR][HEARTBEAT]\n${message}`);
  }

  registerEvent(eventName, handler) {
    if (typeof handler !== 'function') {
      throw new TypeError(`Handler para evento '${eventName}' deve ser uma função.`);
    }
    this.on(eventName, handler);
    this.eventHandlers.set(eventName, handler);
    Logger.info(`[MONITOR] Registrado handler para evento '${eventName}'`);
  }

  emitEvent(eventName, ...args) {
    if (!this.eventHandlers.has(eventName)) {
      Logger.warn(`[MONITOR] Evento '${eventName}' emitido mas não possui handler registrado.`);
    }
    this.emit(eventName, ...args);
  }
}

module.exports = new Monitor();
