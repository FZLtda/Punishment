const { EventEmitter } = require('node:events');
const { reportErrorToWebhook } = require('@utils/webhookMonitor');
const Logger = require('@logger');
const os = require('os');

const monitor = new EventEmitter();

// Logs genéricos
monitor.on('ready', tag => {
  Logger.info(`[MONITOR] Bot online como ${tag}`);
  reportErrorToWebhook('Punishment Online', `Punishment conectado como \`${tag}\``);
});

monitor.on('commandUsed', ({ user, name, guild }) => {
  Logger.info(`[CMD] ${user.tag} usou /${name} em ${guild.name}`);
});

monitor.on('error', (context, error) => {
  Logger.error(`[ERROR][${context}]`, error);
  reportErrorToWebhook(`Erro crítico em ${context}`, error);
});

// Monitoramento de performance a cada 5 minutos
setInterval(() => {
  const mem = process.memoryUsage();
  const usage = `
- Servidores: ${global.client.guilds.cache.size}
- Usuários: ${global.client.users.cache.size}
- Uptime: ${(process.uptime() / 60).toFixed(1)} min
- RAM: ${(mem.rss / 1024 / 1024).toFixed(2)} MB
- CPU: ${os.loadavg().map(x => x.toFixed(2)).join(' / ')} (1/5/15m)
  `;

  Logger.info('[HEARTBEAT] Estado do bot:\n' + usage);
}, 1000 * 60 * 5);
