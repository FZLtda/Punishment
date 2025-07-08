'use strict';

const os = require('os');
const Logger = require('@logger');
const packageJson = require('@package.json');

module.exports = {
  /**
   * Exibe informações diagnósticas detalhadas sobre o estado do bot.
   * @param {import('discord.js').Client} client
   */
  async showStartupDiagnostic(client) {
    const uptime = Math.floor(process.uptime());
    const memoryUsageMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const totalGuilds = client.guilds.cache.size;
    const totalUsers = client.users.cache.size;
    const platformInfo = `${os.type()} ${os.arch()}`;
    const versionInfo = `Node.js ${process.version} | Discord.js v${packageJson.dependencies['discord.js']?.replace('^', '') || 'Desconhecida'}`;

    Logger.box(`${client.user.username} iniciado com sucesso`, [
      `Usuário conectado     : ${client.user.tag}`,
      `Servidores ativos     : ${totalGuilds}`,
      `Usuários em cache     : ${totalUsers}`,
      `Uso de memória        : ${memoryUsageMB} MB`,
      `Uptime do processo    : ${uptime}s`,
      `Plataforma            : ${platformInfo}`,
      `Versões               : ${versionInfo}`
    ]);
  }
};
