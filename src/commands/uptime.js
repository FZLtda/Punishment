const { EmbedBuilder } = require('discord.js');
const os = require('os');

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (days > 0) return `${days}d ${hours}h ${minutes}m ${secs}s`;
  if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
  return `${minutes}m ${secs}s`;
}

module.exports = {
  name: 'uptime',
  description: 'Exibe as estatísticas do bot.',
  usage: '${currentPrefix}uptime',
  permissions: 'Enviar Mensagens',
  execute: async (message) => {
    try {
      
      const installCount = message.client.application?.approximateUserInstallCount || 'Indisponível';
      const serverCount = message.client.guilds.cache.size;
      const uptime = formatUptime(process.uptime());

      const embed = new EmbedBuilder()
        .setColor(0x36393F)
        .setTitle(`${message.client.user.username} • Estatísticas`)
        .addFields(
          {
            name: '<:1000043167:1336329540502421576> Servidores',
            value: `ﾠ \`${serverCount}\``,
            inline: true,
          },
          {
            name: '<:1000043165:1336327290446942280> Instalações',
            value: `ﾠ \`${installCount}\``,
            inline: true,
          },
          {
            name: '<:1000043168:1336330133086273566> Uso de Memória',
            value: `ﾠ \`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\``,
            inline: true,
          },
          {
            name: '<:1000043158:1336324199202947144> Uptime',
            value: `ﾠ \`${uptime}\``,
            inline: true,
          },
          {
            name: '<:1000043170:1336333421412225045> Plataforma',
            value: `ﾠ \`${os.platform()}\``,
            inline: true,
          }
        )
        .setFooter({
          text: `${message.client.user.username}`,
          iconURL: message.client.user.displayAvatarURL(),
        });

      return message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('[ERROR] Não foi possível obter as estatísticas:', error);
      const embedErroMinimo = new EmbedBuilder()
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Não foi possível recuperar as estatísticas do bot devido a um erro.',
          iconURL: 'http://bit.ly/4aIyY9j'
      });

  return message.reply({ embeds: [embedErroMinimo] });
    }
  },
};
