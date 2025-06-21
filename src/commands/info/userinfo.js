const { EmbedBuilder } = require('discord.js');
const moment = require('moment-timezone');
const { colors, emojis } = require('@config');

module.exports = {
  name: 'userinfo',
  description: 'Mostra informações sobre um usuário.',
  usage: '${currentPrefix}userinfo [usuário]',
  userPermissions: ['SendMessages'],
  botPermissions: ['SendMessages'],
  deleteMessage: true,
  
  async execute(message) {
    const user = message.mentions.users.first() || message.author;
    const member = message.guild.members.cache.get(user.id);

    const createdAt = moment(user.createdAt).tz('America/Sao_Paulo').format('DD/MM/YYYY [às] HH:mm:ss');
    const joinedAt = member.joinedAt
      ? moment(member.joinedAt).tz('America/Sao_Paulo').format('DD/MM/YYYY [às] HH:mm:ss')
      : 'Não disponível';

    const embed = new EmbedBuilder()
      .setTitle(`<:1000046547:1340465282568945675> Informações de ${user.displayName}`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
      .setColor(colors.red)
      .addFields(
        { name: 'Usuário', value: user.tag, inline: true },
        { name: 'ID', value: user.id, inline: true },
        { name: 'Conta criada', value: createdAt, inline: true },
        { name: 'Entrou no servidor', value: joinedAt, inline: true },
        {
          name: 'Cargos',
          value: member.roles.cache
            .filter((role) => role.name !== '@everyone')
            .map((role) => role)
            .join(', ') || 'Sem cargos',
          inline: true,
        }
      )
      .setFooter({
        text: `${message.author.username}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      })
      .setTimestamp();

    return message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
  },
};
