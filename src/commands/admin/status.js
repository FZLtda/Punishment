'use strict';

const { EmbedBuilder } = require('discord.js');
const os = require('os');
const { getSystemHealth } = require('@utils/healthMonitor');
const { colors, emojis } = require('@config');
const Logger = require('@logger');

module.exports = {
  name: 'status',
  description: 'Exibe o status de conexão do bot e seus serviços.',
  usage: '${currentPrefix}status',
  category: 'Sistema',
  cooldown: 5,
  userPermissions: ['ManageGuild'],
  deleteMessage: true,

  async execute(message) {
    try {
      const { client } = message;

      const healthData = await getSystemHealth(client);

      const mongoStatus = healthData?.mongoStatus?.status ?? 'Desconhecido';
      const latency = typeof healthData?.discordLatency === 'number' ? `${healthData.discordLatency}ms` : 'N/A';
      const prefixCount = healthData?.commandStats?.prefixCount ?? 0;
      const slashCount = healthData?.commandStats?.slashCount ?? 0;

      const memoryUsage = process.memoryUsage().rss / 1024 / 1024;
      const uptime = formatUptime(process.uptime());
      const cpuLoad = os.loadavg().map(avg => avg.toFixed(2)).join(' / ');

      Logger.debug(`[STATUS] Latência: ${latency}, Mongo: ${mongoStatus}, Memória: ${memoryUsage.toFixed(2)}MB`);

      const embed = new EmbedBuilder()
        .setColor(colors.green)
        .setTitle('📊 Diagnóstico do sistema')
        .addFields(
          { name: '🟢 MongoDB', value: mongoStatus, inline: true },
          { name: '📡 Latência Discord', value: latency, inline: true },
          { name: '📦 Comandos carregados', value: `Prefix: \`${prefixCount}\`\nSlash: \`${slashCount}\``, inline: true },
          { name: '🧠 Uso de RAM', value: `${memoryUsage.toFixed(2)} MB`, inline: true },
          { name: '⏱️ Uptime do processo', value: uptime, inline: true },
          { name: '🧮 Carga da CPU', value: cpuLoad, inline: true },
          { name: '🧩 Node.js', value: `v${process.version}`, inline: true }
        )
        .setFooter({
          text: `${client.user?.username}`,
          iconURL: client.user?.displayAvatarURL()
        })
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });

    } catch (error) {
      Logger.error(`Erro ao executar o comando 'status': ${error.stack || error.message}`);

      const errorEmbed = new EmbedBuilder()
        .setColor(colors.red)
        .setTitle(`${emojis.attent} Erro ao exibir o status`)
        .setDescription('Ocorreu um erro inesperado ao tentar obter o status do sistema.')
        .setFooter({
          text: 'Punishment • erro interno',
          iconURL: message.client.user?.displayAvatarURL()
        })
        .setTimestamp();

      await message.channel.send({ embeds: [errorEmbed] }).catch(() => {
        message.reply('Ocorreu um erro e não foi possível enviar o embed.');
      });
    }
  }
};

/**
 * Converte uptime em formato legível
 * @param {number} seconds
 * @returns {string}
 */
function formatUptime(seconds) {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
}
