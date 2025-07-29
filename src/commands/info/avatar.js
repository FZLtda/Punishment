'use strict';

const { EmbedBuilder } = require('discord.js');
const { sendWarning } = require('@utils/embedWarning');
const { emojis, colors } = require('@config');

module.exports = {
  name: 'avatar',
  description: 'Exibe o avatar de um usuário mencionado ou seu próprio.',
  usage: '${currentPrefix}avatar [@usuário]',
  category: 'info',
  botPermissions: ['SendMessages', 'EmbedLinks'],
  userPermissions: [],
  deleteMessage: true,

  /**
   * Executa o comando de avatar
   * @param {import('discord.js').Message} message
   * @param {string[]} args
   */
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

    return message.channel.send({ embeds: [embed] });
  }
};
