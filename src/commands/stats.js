const { EmbedBuilder } = require('discord.js');
const os = require('os');

module.exports = {
  name: 'stats',
  description: 'Exibe as estatísticas do bot.',
  usage: '.stats',
  permissions: 'Nenhuma',
  execute: async (message) => {
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const embed = new EmbedBuilder()
      .setColor(0x00aaff)
      .setTitle(`${message.client.user.username} • Estatísticas`)
      .addFields(
        {
          name: '<:1000043167:1336329540502421576> Servidores',
          value: `ﾠ \`${message.client.guilds.cache.size}\``,
          inline: true,
        },
        {
          name: '<:1000043165:1336327290446942280> Instalações',
          value: `ﾠ \`${message.client.users.cache.size}\``,
          inline: true,
        },
        {
          name: '<:1000043168:1336330133086273566> Uso de Memória',
          value: `ﾠ \`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\``,
          inline: true,
        },
        {
          name: '<:1000043158:1336324199202947144> Uptime',
          value: `ﾠ \`${days}d ${hours}h ${minutes}m ${seconds}s\``,
          inline: true,
        },
        {
          name: '<:1000043170:1336333421412225045> Plataforma',
          value: `ﾠ \`${os.platform()}\``,
          inline: true,
        }
      )
      .setFooter({
        text: message.client.user.username,
        iconURL: message.client.user.displayAvatarURL(),
      });

    return message.reply({ embeds: [embed] });
  },
};