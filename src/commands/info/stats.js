'use strict';

const os = require('os');
const { EmbedBuilder } = require('discord.js');
const { getSystemHealth } = require('@utils/healthMonitor');
const { colors, emojis, bot } = require('@config');
const packageJson = require('@package.json');
const Logger = require('@logger');

module.exports = {
  name: 'stats',
  description: 'Exibe diagnósticos e estatísticas detalhadas sobre o sistema e o bot.',
  usage: '${currentPrefix}stats',
  aliases: ['status', 'uptime', 'diagnostico'],
  category: 'info',
  deleteMessage: true,
  userPermissions: ['ManageGuild'],
  cooldown: 5,

  async execute(message) {
    const { client } = message;

    if (message.author.id !== bot.owner) return;

    try {
      await client.application.fetch();
      const health = await getSystemHealth(client);

      const mongoStatus = health?.mongoStatus?.status ?? 'Desconhecido';
      const discordLatency = typeof health?.discordLatency === 'number' ? `${health.discordLatency}ms` : 'N/A';
      const prefixCount = health?.commandStats?.prefixCount ?? 0;
      const slashCount = health?.commandStats?.slashCount ?? 0;

      const uptime = formatUptime(process.uptime());
      const memory = process.memoryUsage();
      const usedMB = Math.round((memory.heapUsed + memory.external + memory.arrayBuffers) / 1024 / 1024);
      const totalMB = Math.round(os.totalmem() / 1024 / 1024);
      const cpuLoad = os.loadavg().map(avg => avg.toFixed(2)).join(' / ');

      Logger.debug(`[STATS] Latência: ${discordLatency}, MongoDB: ${mongoStatus}, RAM: ${usedMB}MB`);

      const embed = new EmbedBuilder()
        .setColor(colors.green)
        .setTitle(`${emojis.ping || '📶'} Diagnóstico e Estatísticas`)
        .setDescription('Abaixo estão os dados técnicos do sistema e desempenho do bot.')
        .addFields(
          { name: '📡 Latência Discord', value: discordLatency, inline: true },
          { name: '🧠 Uso de Memória', value: `\`${usedMB}MB / ${totalMB}MB\``, inline: true },
          { name: '🧩 Versão do Bot', value: `v${packageJson.version}`, inline: true },
          { name: '📁 Servidores Ativos', value: `${client.guilds.cache.size}`, inline: true },
          { name: '⏱️ Uptime', value: uptime, inline: true },
          { name: '⚙️ Carga da CPU', value: cpuLoad, inline: true },
          { name: '🗃️ MongoDB', value: mongoStatus, inline: true },
          { name: '📜 Comandos Carregados', value: `Prefix: \`${prefixCount}\`\nSlash: \`${slashCount}\``, inline: true },
          { name: '🛠️ Node.js', value: process.version, inline: true }
        )
        .setFooter({
          text: `${message.author.username}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });

    } catch (err) {
      Logger.error(`Erro ao executar comando stats: ${err.stack || err.message}`);

      const errorEmbed = new EmbedBuilder()
        .setColor(colors.red)
        .setTitle(`${emojis.attent || '⚠️'} Erro ao obter estatísticas`)
        .setDescription('Ocorreu um erro inesperado ao tentar carregar as informações de status.')
        .setFooter({
          text: 'Punishment • erro interno',
          iconURL: client.user.displayAvatarURL()
        })
        .setTimestamp();

      return message.channel.send({ embeds: [errorEmbed] }).catch(() => {
        message.reply('Erro interno ao tentar enviar o embed.');
      });
    }
  }
};

/**
 * Converte segundos de uptime em string legível
 */
function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const parts = [];
  if (d) parts.push(`${d}d`);
  if (h || d) parts.push(`${h}h`);
  if (m || h || d) parts.push(`${m}m`);
  parts.push(`${s}s`);

  return parts.join(' ');
}
