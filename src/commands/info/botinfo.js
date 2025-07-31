'use strict';

const { EmbedBuilder } = require('discord.js');
const os = require('node:os');
const process = require('node:process');
const { version: discordJsVersion } = require('discord.js');
const { colors } = require('@config');

module.exports = {
  name: 'botinfo',
  description: 'Exibe informações detalhadas e técnicas sobre o bot.',
  usage: '${currentPrefix}botinfo',
  category: 'Informação',
  botPermissions: ['SendMessages'],
  deleteMessage: true,

  /**
   * Executa o comando e envia um embed com informações técnicas do bot.
   * @param {import('discord.js').Message} message
   */
  
  async execute(message) {
    const { client } = message;

    const totalSeconds = Math.floor(client.uptime / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const uptime = `${days}d ${hours}h ${minutes}m ${seconds}s`;

    const heapUsedMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const totalMemoryMB = (os.totalmem() / 1024 / 1024).toFixed(0);

    const osType = os.type();
    const platform = os.platform();
    const architecture = os.arch();
    const cpuModel = os.cpus()[0].model;

    const embed = new EmbedBuilder()
      .setColor(colors.red)
      .setTitle('Informações do Bot')
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        
        { name: 'Nome', value: `\`${client.user.username}\``, inline: true },
        { name: 'Ping', value: `\`${client.ws.ping}ms\``, inline: true },
        { name: 'Servidores', value: `\`${client.guilds.cache.size}\``, inline: true },
        { name: 'Usuários', value: `\`${client.users.cache.size}\``, inline: true },
        { name: 'Criado em', value: `<t:${Math.floor(client.user.createdTimestamp / 1000)}:R>`, inline: true },

        { name: 'Uptime', value: `\`${uptime}\``, inline: true },
        { name: 'Node.js', value: `\`${process.version}\``, inline: true },
        { name: 'Discord.js', value: `\`v${discordJsVersion}\``, inline: true },

        { name: 'Memória usada', value: `\`${heapUsedMB} MB / ${totalMemoryMB} MB\``, inline: true },
        { name: 'Sistema', value: `\`${osType} (${platform})\``, inline: true },
        { name: 'CPU', value: `\`${architecture} - ${cpuModel}\`` }
      )
      .setFooter({
        text: `ID: ${client.user.id}`,
        iconURL: client.user.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();

    return message.channel.send({ embeds: [embed] });
  }
};
