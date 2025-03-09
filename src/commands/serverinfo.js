const { EmbedBuilder } = require('discord.js');
const moment = require('moment-timezone');

module.exports = {
  name: 'serverinfo',
  description: 'Mostra informações sobre o servidor.',
  usage: '${currentPrefix}serverinfo',
  permissions: 'Enviar Mensagens',
  async execute(message) {
    const guild = message.guild;
    const createdAt = moment(guild.createdAt)
      .tz('America/Sao_Paulo')
      .format('DD/MM/YYYY [às] HH:mm:ss');
    const owner = await guild.fetchOwner();

    const memberCount = guild.memberCount;
    const botsCount = guild.members.cache.filter((member) => member.user.bot).size;
    const humansCount = memberCount - botsCount;

    const textChannels = guild.channels.cache.filter((channel) => channel.type === 0).size;
    const voiceChannels = guild.channels.cache.filter((channel) => channel.type === 2).size;
    const categories = guild.channels.cache.filter((channel) => channel.type === 4).size;

    const embed = new EmbedBuilder()
      .setTitle(`<:1000046551:1340466667779784777> Informações de ${guild.name}`)
      .setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }))
      .setColor('fe3838')
      .addFields(
        { name: 'Nome', value: guild.name, inline: true },
        { name: 'ID', value: guild.id, inline: true },
        { name: 'Dono', value: `${owner.displayName} (`${owner.user.id}`)`, inline: true },
        { name: 'Criado em', value: createdAt, inline: true },
        { name: 'Membros', value: `${memberCount} (Humanos: ${humansCount}, Bots: ${botsCount})`, inline: true },
        { name: 'Canais', value: `Texto: ${textChannels} | Voz: ${voiceChannels} | Categorias: ${categories}`, inline: true },
        { name: 'Emojis', value: `${guild.emojis.cache.size} emojis`, inline: true }
      )
      .setFooter({
        text: `${message.author.username}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      })
      .setTimestamp();

    return message.channel.send({ embeds: [embed] });
  },
};
