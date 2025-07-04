'use strict';

const { EmbedBuilder } = require('discord.js');
const { colors, emojis } = require('@config');

module.exports = {
  name: 'userinfo',
  description: 'Exibe informações detalhadas sobre um usuário.',
  usage: '${currentPrefix}userinfo [@usuário|ID]',
  category: 'Informação',
  botPermissions: ['SendMessages'],
  deleteMessage: true,

  async execute(message, args) {
    const membro = message.mentions.members.first()
      || message.guild.members.cache.get(args[0])
      || message.member;

    const user = membro.user;

    const cargos = membro.roles.cache
      .filter(role => role.id !== message.guild.id)
      .map(role => role.toString())
      .join(', ') || 'Nenhum';

    const formatarData = timestamp => {
      const data = new Date(timestamp);
      return data.toLocaleDateString('pt-BR') + ' às ' + data.toLocaleTimeString('pt-BR');
    };

    const embed = new EmbedBuilder()
      .setTitle(`${emojis.info} Informações de ${user.displayName}`)
      .setColor(colors.red)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: '**Usuário**', value: `${user.tag}`, inline: false },
        { name: '**ID**', value: `\`${user.id}\``, inline: false },
        { name: '**Conta criada**', value: formatarData(user.createdAt), inline: false },
        { name: '**Entrou no servidor**', value: formatarData(membro.joinedAt), inline: false },
        { name: '**Cargos**', value: cargos, inline: false }
      )
      .setFooter({
        text: `${message.author.tag}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();

    return message.channel.send({ embeds: [embed] });
  }
};
