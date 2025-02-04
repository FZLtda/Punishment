const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const os = require('os');

module.exports = {
  name: 'stats',
  description: 'Exibe as estatísticas do bot.',
  usage: '.stats',
  permissions: 'Nenhuma',
  execute: async (message) => {
    try {
     
      const response = await axios.get(`https://discord.com/api/v10/applications/${process.env.CLIENT_ID}`, {
        headers: {
          Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
        },
      });

      const installCount = response.data.install_count || 0; // Contagem de instalações

      
      const uptime = process.uptime();
      const days = Math.floor(uptime / 86400);
      const hours = Math.floor((uptime % 86400) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);

      
      const embed = new EmbedBuilder()
        .setColor(0xfe3838)
        .setTitle(`${message.client.user.username} • Estatísticas`)
        .addFields(
          {
            name: '<:1000043167:1336329540502421576> Servidores',
            value: `ﾠ \`${message.client.guilds.cache.size}\``,
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
    } catch (error) {
      console.error('[ERROR] Não foi possível obter as estatísticas:', error);
      return message.reply(':x: Não foi possível recuperar as estatísticas do bot.');
    }
  },
};
