const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const moment = require('moment-timezone');

module.exports = {
  name: 'userinfo',
  description: 'Exibe informações detalhadas sobre um usuário.',
  async execute(message, args) {
    const user = message.mentions.users.first() || message.author;
    const member = message.guild.members.cache.get(user.id);

    const createdAt = moment(user.createdAt).tz('America/Sao_Paulo').format('DD/MM/YYYY [às] HH:mm:ss');
    const joinedAt = member.joinedAt
      ? moment(member.joinedAt).tz('America/Sao_Paulo').format('DD/MM/YYYY [às] HH:mm:ss')
      : 'Não disponível';

    const embed = new EmbedBuilder()
      .setTitle(`Informações de ${user.displayName}`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
      .setColor('Blue')
      .addFields(
        { name: 'Nome de Usuário', value: user.tag, inline: true },
        { name: 'ID do Usuário', value: user.id, inline: true },
        { name: 'Criado em', value: createdAt, inline: true },
        { name: 'Entrou no Servidor em', value: joinedAt, inline: true },
        {
          name: 'Cargos',
          value: member.roles.cache
            .filter((role) => role.name !== '@everyone')
            .map((role) => role)
            .join(', ') || 'Sem cargos',
          inline: false,
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