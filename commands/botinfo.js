const { EmbedBuilder } = require('discord.js');
const os = require('os');
const moment = require('moment-timezone');

module.exports = {
  name: 'botinfo',
  description: 'Exibe informações sobre o bot.',
  async execute(message, args) {
    try {
      const client = message.client;

      const totalGuilds = client.guilds.cache.size;
      const totalMembers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
      const uptime = moment.duration(client.uptime).humanize();
      const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

      const creationDate = moment(client.user?.createdAt)
        .tz('America/Sao_Paulo')
        .format('DD/MM/YYYY [às] HH:mm:ss');

      const botEmbed = new EmbedBuilder()
        .setColor('#fe3838')
        .setTitle('Informações do Bot')
        .setThumbnail(client.user?.displayAvatarURL({ dynamic: true }) || null)
        .addFields(
          { name: 'Nome', value: client.user?.tag || 'Indisponível', inline: true },
          { name: 'ID', value: client.user?.id || 'Indisponível', inline: true },
          { name: 'Servidores', value: `${totalGuilds}`, inline: true },
          { name: 'Usuários', value: `${totalMembers}`, inline: true },
          { name: 'Uptime', value: `${uptime}`, inline: true },
          { name: 'Uso de Memória', value: `${memoryUsage} MB`, inline: true },
          { name: 'Plataforma', value: `${os.platform()} ${os.arch()}`, inline: true },
          { name: 'Biblioteca', value: 'discord.js v14', inline: true },
          { name: 'Criado em', value: creationDate || 'Indisponível', inline: false },
        )
        .setFooter({
          text: `${message.author.tag}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      await message.channel.send({ embeds: [botEmbed] });
    } catch (error) {
      console.error('Erro ao executar o comando botinfo:', error);
      await message.reply('<:no:1122370713932795997> Não foi possível executar este comando.');
    }
  },
};