'use strict';

const { EmbedBuilder, ActionRowBuilder, UserSelectMenuBuilder } = require('discord.js');
const { sendWarning } = require('@embeds/embedWarning');
const { colors } = require('@config');

module.exports = {
  name: 'avatar',
  description: 'Exibe o avatar de um usuário mencionado ou seu próprio.',
  usage: '${currentPrefix}avatar [@usuário]',
  category: 'info',
  botPermissions: ['SendMessages', 'EmbedLinks'],
  userPermissions: [],
  deleteMessage: true,

  async execute(message, args) {
    const membro = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;

    if (!membro)
      return sendWarning(message, 'Usuário não encontrado. Tente mencionar alguém ou informar o ID.');

    const avatarUrl = membro.displayAvatarURL({ dynamic: true, size: 1024 });

    const embed = new EmbedBuilder()
      .setColor(colors.red)
      .setTitle(`Avatar de ${membro.displayName || membro.user.tag}`)
      .setImage(avatarUrl)
      .setFooter({
        text: `${message.author.username}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();

    const userSelectMenu = new UserSelectMenuBuilder()
      .setCustomId('select-avatar-user')
      .setPlaceholder('Selecione um usuário para ver o avatar');

    const row = new ActionRowBuilder().addComponents(userSelectMenu);

    await message.channel.send({ embeds: [embed], components: [row] });
  }
};
