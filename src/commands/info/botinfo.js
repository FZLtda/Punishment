'use strict';

const { EmbedBuilder } = require('discord.js');
const os = require('node:os');
const process = require('node:process');
const { version: discordJsVersion } = require('discord.js');
const { colors } = require('@config');

module.exports = {
  name: 'botinfo',
  description: 'Exibe informações técnicas e detalhadas sobre o bot.',
  usage: '${currentPrefix}botinfo',
  category: 'Informação',
  botPermissions: ['SendMessages'],
  deleteMessage: true,

  /**
   * @param {import('discord.js').Message} message
   */
  async execute(message) {
    const { client } = message;

    /* Uptime */
    const uptimeSeconds = Math.floor(process.uptime());
    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = uptimeSeconds % 60;
    const uptime = `${days}d ${hours}h ${minutes}m ${seconds}s`;

    /* Memória */
    const memory = process.memoryUsage();
    const rssMB = (memory.rss / 1024 / 1024).toFixed(2);
    const heapUsedMB = (memory.heapUsed / 1024 / 1024).toFixed(2);
    const heapTotalMB = (memory.heapTotal / 1024 / 1024).toFixed(2);
    const totalSystemMemoryMB = (os.totalmem() / 1024 / 1024).toFixed(0);
    const memoryPercent = ((memory.rss / os.totalmem()) * 100).toFixed(2);

    /* CPU */
    const cpuUsage = process.cpuUsage();
    const cpuUserMs = (cpuUsage.user / 1000).toFixed(0);
    const cpuSystemMs = (cpuUsage.system / 1000).toFixed(0);
    const cpuInfo = os.cpus();
    const cpuModel = cpuInfo?.[0]?.model ?? 'Desconhecido';
    const cpuCores = cpuInfo.length;

    /* Sistema */
    const platform = `${os.type()} (${os.platform()})`;
    const architecture = os.arch();

    /* Usuários */
    const totalUsers = client.guilds.cache.reduce(
      (acc, guild) => acc + (guild.memberCount || 0),
      0
    );

    const embed = new EmbedBuilder()
      .setColor(colors.red)
      .setTitle('Informações do Bot')
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        {
          name: 'Bot',
          value:
            `Nome: \`${client.user.username}\`\n` +
            `ID: \`${client.user.id}\`\n` +
            `Criado: <t:${Math.floor(client.user.createdTimestamp / 1000)}:R>`,
          inline: false
        },
        {
          name: 'Estatísticas',
          value:
            `Ping: \`${client.ws.ping}ms\`\n` +
            `Servidores: \`${client.guilds.cache.size}\`\n` +
            `Usuários: \`${totalUsers.toLocaleString('pt-BR')}\``,
          inline: true
        },
        {
          name: 'Uptime',
          value: `\`${uptime}\``,
          inline: true
        },
        {
          name: 'Sistema',
          value:
            `OS: \`${platform}\`\n` +
            `Arquitetura: \`${architecture}\`\n` +
            `CPU: \`${cpuModel}\`\n` +
            `Cores: \`${cpuCores}\``,
          inline: false
        },
        {
          name: 'Memória',
          value:
            `RSS: \`${rssMB} MB\`\n` +
            `Heap: \`${heapUsedMB} / ${heapTotalMB} MB\`\n` +
            `RAM do sistema: \`${totalSystemMemoryMB} MB\`\n` +
            `Uso da RAM: \`${memoryPercent}%\``,
          inline: true
        },
        {
          name: 'Processo',
          value:
            `Node.js: \`${process.version}\`\n` +
            `Discord.js: \`v${discordJsVersion}\`\n` +
            `CPU user: \`${cpuUserMs} ms\`\n` +
            `CPU system: \`${cpuSystemMs} ms\``,
          inline: true
        }
      )
      .setFooter({
        text: 'Punishment',
        iconURL: client.user.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();

    return message.channel.send({ embeds: [embed] });
  }
};
