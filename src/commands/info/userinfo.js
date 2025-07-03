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
    const cargoMaisAlto = membro.roles?.highest?.name ?? 'Nenhum';
    const boost = membro.premiumSince ? '<:boost:123456>' : '—';

    const embed = new EmbedBuilder()
      .setAuthor({ name: `Informações de ${user.username}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
      .setColor(colors.purple)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: '🆔 ID', value: `\`${user.id}\``, inline: true },
        { name: '🙋 Nome de usuário', value: `${user.tag}`, inline: true },
        { name: '📅 Conta criada em', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: false },
        { name: '📌 Entrou no servidor', value: `<t:${Math.floor(membro.joinedTimestamp / 1000)}:F>`, inline: true },
        { name: '🏷️ Maior cargo', value: cargoMaisAlto, inline: true },
        { name: '🚀 Impulsionador', value: boost, inline: true }
      )
      .setFooter({ text: `Solicitado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
      .setTimestamp();

    return message.channel.send({ embeds: [embed] });
  }
};
