const { EmbedBuilder } = require('discord.js');
const moment = require('moment-timezone');

module.exports = {
  name: 'serverinfo',
  description: 'Exibe informações detalhadas sobre o servidor.',
  async execute(message) {
    const guild = message.guild;

    const createdAt = moment(guild.createdAt).tz('America/Sao_Paulo').format('DD/MM/YYYY [às] HH:mm:ss');
    const owner = await guild.fetchOwner();

    const embed = new EmbedBuilder()
      .setTitle(`Informações do Servidor: ${guild.name}`)
      .setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }))
      .setColor('Green')
      .addFields(
        { name: 'Nome do Servidor', value: guild.name, inline: true },
        { name: 'ID do Servidor', value: guild.id, inline: true },
        { name: 'Dono do Servidor', value: `${owner.user.tag} (${owner.user.id})`, inline: true },
        { name: 'Criado em', value: createdAt, inline: true },
        { name: 'Membros', value: `${guild.memberCount} membros`, inline: true },
        { name: 'Canais', value: `${guild.channels.cache.size} canais`, inline: true },
        { name: 'Região', value: guild.preferredLocale || 'Desconhecida', inline: true },
        {
          name: 'Regras',
          value: guild.rulesChannel ? guild.rulesChannel.name : 'Não definido',
          inline: true,
        }
      )
      .setFooter({
        text: `${message.author.username}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      })
      .setTimestamp();

    return message.channel.send({ embeds: [embed] });
  },
};