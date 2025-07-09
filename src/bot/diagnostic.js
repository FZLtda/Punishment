'use strict';

const os = require('os');
const Logger = require('@logger');
const { bot } = require('@config');
const packageJson = require('@package.json');

module.exports = {
  /**
   * Exibe informações diagnósticas sobre o estado do bot.
   * @param {import('discord.js').Client} client
   */
  async showStartupDiagnostic(client) {
    const uptime = Math.floor(process.uptime());
    const memoryUsageMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const totalGuilds = client.guilds.cache.size;
    const totalUsers = client.users.cache.size;
    const platformInfo = `${os.type()} ${os.arch()}`;
    const discordJsVersion = packageJson.dependencies['discord.js']?.replace('^', '') || 'Desconhecida';
    const versionInfo = `Node.js ${process.version} | Discord.js v${discordJsVersion}`;

    Logger.info(` ${bot.name} foi iniciado com sucesso`);
    Logger.info(`Servidores ativos     : ${totalGuilds}`);
    Logger.info(`Usuários em cache     : ${totalUsers}`);
    Logger.info(`Uso de memória        : ${memoryUsageMB} MB`);
    Logger.info(`Uptime do processo    : ${uptime}s`);
    Logger.info(`Plataforma            : ${platformInfo}`);
    Logger.info(`Versões               : ${versionInfo}`);
  }
};
