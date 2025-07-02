'use strict';

const { EmbedBuilder } = require('discord.js');
const { colors, emojis } = require('@config');

module.exports = {
  name: 'ban',
  description: 'Bane permanentemente um membro do servidor.',
  usage: '${currentPrefix}ban <@usuário> [motivo]',
  userPermissions: ['BanMembers'],
  botPermissions: ['BanMembers'],
  deleteMessage: true,

  async execute(message, args) {
    const membro = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    const motivo = args.slice(1).join(' ') || 'Não especificado.';

    if (!membro) return sendError(message, 'Mencione um usuário para executar esta ação.');
    if (membro.id === message.author.id) return sendError(message, 'Você não pode banir a si mesmo.');
    if (membro.id === message.guild.ownerId) return sendError(message, 'Você não pode banir o dono do servidor.');
    if (!membro.bannable) return sendError(message, 'Este usuário não pode ser banido devido às suas permissões ou posição hierárquica.');

    try {
      await membro.ban({ reason: motivo });

      const embed = new EmbedBuilder()
        .setTitle(`${emojis.ban} Punição aplicada`)
        .setColor(colors.red)
        .setDescription(`${membro} (\`${membro.id}\`) foi banido permanentemente.`)
        .addFields(
          { name: 'Motivo', value: `\`${motivo}\``, inline: true }
        )
        .setThumbnail(membro.user.displayAvatarURL({ dynamic: true }))
        .setFooter({
          text: `${message.author.username}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      return sendError(message, 'Não foi possível banir o usuário devido a um erro inesperado.');
    }
  }
};

function sendError(message, texto) {
  const embed = new EmbedBuilder()
    .setColor(colors.yellow)
    .setAuthor({ name: texto, iconURL: emojis.attention });

  return message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
}
