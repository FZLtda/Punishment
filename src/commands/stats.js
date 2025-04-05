const { EmbedBuilder } = require('discord.js');
const os = require('os');
const { version: discordJsVersion } = require('discord.js');
const { version: nodeVersion } = process;

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
  name: 'stats',
  description: 'Exibe as estatísticas detalhadas do bot e do sistema.',
  usage: '${currentPrefix}stats',
  userPermissions: ['SendMessages'],
  botPermissions: ['SendMessages'],
  deleteMessage: true,
  
  execute: async (message) => {
    try {
      const installCount = message.client.application?.approximateUserInstallCount || 'Indisponível';
      const serverCount = message.client.guilds.cache.size;
      const userCount = message.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
      const channelCount = message.client.channels.cache.size;
      const uptime = formatUptime(process.uptime());
      const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
      const totalMemory = (os.totalmem() / 1024 / 1024).toFixed(2);
      const freeMemory = (os.freemem() / 1024 / 1024).toFixed(2);
      const cpuModel = os.cpus()[0].model;
      const cpuUsage = os.loadavg()[0].toFixed(2);

      const embed = new EmbedBuilder()
        .setColor('#FE3838')
        .setTitle(`${message.client.user.username} • Estatísticas`)
        .addFields(
          {
            name: '<:1000043167:1336329540502421576> Servidores',
            value: `ﾠ \`${serverCount}\``,
            inline: true,
          },
          {
            name: '<:1000043165:1336327290446942280> Usuários',
            value: `ﾠ \`${userCount}\``,
            inline: true,
          },
          {
            name: '<:1000055959:1357117904948039700> Canais',
            value: `ﾠ \`${channelCount}\``,
            inline: true,
          },
          {
            name: '<:1000043168:1336330133086273566> Uso de Memória',
            value: `ﾠ \`${memoryUsage} MB / ${totalMemory} MB\``,
            inline: true,
          },
          {
            name: '<:1000043158:1336324199202947144> Uptime',
            value: `ﾠ \`${uptime}\``,
            inline: true,
          },
          {
            name: '<:1000043170:1336333421412225045> Plataforma',
            value: `ﾠ \`${os.platform()} (${os.arch()})\``,
            inline: true,
          },
          {
            name: '<:1000055958:1357117888045256775> Uso de CPU',
            value: `ﾠ \`${cpuUsage}%\``,
            inline: true,
          },
          {
            name: '<:1000055960:1357117922505527468> Node.js',
            value: `ﾠ \`${nodeVersion}\``,
            inline: true,
          },
          {
            name: '<:1000056224:1357496993014091816> Discord.js',
            value: `ﾠ \`v${discordJsVersion}\``,
            inline: true,
          }
        )
        .setFooter({
          text: `${message.client.user.username}`,
          iconURL: message.client.user.displayAvatarURL(),
        });

      return message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
    } catch (error) {
      console.error('[ERROR] Não foi possível obter as estatísticas:', error);
      const embedErroMinimo = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({
          name: 'Não foi possível recuperar as estatísticas do bot devido a um erro.',
          iconURL: 'http://bit.ly/4aIyY9j',
        });

      return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
    }
  },
};
