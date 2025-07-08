'use strict';

const Logger = require('@logger');
const os = require('os');
const packageJson = require('@package.json');

module.exports = {
  async showStartupDiagnostic(client) {
    const uptime = process.uptime().toFixed(0);
    const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const guilds = client.guilds.cache.size;
    const users = client.users.cache.size;
    const platform = `${os.type()} ${os.arch()}`;
    const version = `Node.js ${process.version} | Discord.js v${packageJson.dependencies['discord.js'] || 'Desconhecida'}`;

    Logger.box('Punishment iniciado com sucesso', [
      `Usuário         : ${client.user.tag}`,
      `Servidores      : ${guilds}`,
      `Usuários Cache  : ${users}`,
      `Memória         : ${memoryUsage} MB`,
      `Tempo de Atividade: ${uptime}s`,
      `Plataforma      : ${platform}`,
      `Versões         : ${version}`
    ]);
  }
};
