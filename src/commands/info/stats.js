'use strict';

const os = require('os');
const { EmbedBuilder } = require('discord.js');
const { colors, emojis } = require('@config');
const packageJson = require('@package.json');

module.exports = {
  name: 'stats',
  description: 'Exibe estatísticas detalhadas sobre o bot.',
  usage: '${currentPrefix}stats',
  aliases: ['uptime', 'status', 'usage'],
  category: 'info',
  deleteMessage: true,

  async execute(message) {
    const client = message.client;

    // Garante que os dados da aplicação estejam atualizados
    await client.application.fetch();

    const uptime = formatUptime(process.uptime());
    const memoryUsage = process.memoryUsage();
    const totalMemoryMB = Math.round(os.totalmem() / 1024 / 1024);
    const usedMemoryMB = Math.round((memoryUsage.heapUsed + memoryUsage.external + memoryUsage.arrayBuffers) / 1024 / 1024);
    const ping = Math.round(client.ws.ping);

    const embed = new EmbedBuilder()
      .setColor(colors.red)
      .setTitle(`${emojis.ping || '📊'} Estatísticas do Bot`)
      .setDescription('Abaixo estão as estatísticas atuais do sistema e da aplicação.')
      .addFields(
        { name: '🧠 Memória Utilizada', value: `\`${usedMemoryMB}MB / ${totalMemoryMB}MB\``, inline: true },
        { name: '📡 Ping da API', value: `\`${ping}ms\``, inline: true },
        { name: '⏱️ Uptime', value: `\`${uptime}\``, inline: true },
        { name: '🧩 Versão', value: `\`v${packageJson.version}\``, inline: true },
        { name: '📁 Servidores', value: `\`${client.guilds.cache.size.toLocaleString()}\``, inline: true },
        { name: '👤 Instalações', value: `\`${client.application.approximateInstallCount?.toLocaleString() || 'Indisponível'}\``, inline: true },
      )
      .setFooter({
        text: `Requisitado por ${message.author.username}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();

    return message.channel.send({ embeds: [embed] });
  }
};

function formatUptime(seconds) {
  const pad = s => (s < 10 ? '0' : '') + s;
  const d = Math.floor(seconds / (60 * 60 * 24));
  const h = Math.floor(seconds % (60 * 60 * 24) / 3600);
  const m = Math.floor(seconds % 3600 / 60);
  const s = Math.floor(seconds % 60);

  const parts = [];
  if (d) parts.push(`${pad(d)}d`);
  if (h || d) parts.push(`${pad(h)}h`);
  if (m || h || d) parts.push(`${pad(m)}m`);
  parts.push(`${pad(s)}s`);

  return parts.join(' ');
}
