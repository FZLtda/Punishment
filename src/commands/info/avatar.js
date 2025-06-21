const { EmbedBuilder } = require('discord.js');
const { colors, emojis } = require('@config');

module.exports = {
  name: 'avatar',
  description: 'Exibe o avatar de um usuário.',
  usage: '${currentPrefix}avatar [<@usuário>]',
  userPermissions: ['SendMessages'],
  botPermissions: ['SendMessages'],
  deleteMessage: true,
    
  async execute(message) {
    const usuario = message.mentions.users.first() || message.author;

    try {
      const avatarEmbed = new EmbedBuilder()
        .setTitle(`Avatar de ${usuario.displayName}`)
        .setImage(usuario.displayAvatarURL({ dynamic: true, size: 1024 }))
        .setColor('#f33838')
        .setFooter({
          text: `${message.author.username}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      await message.channel.send({ embeds: [avatarEmbed], allowedMentions: { repliedUser: false } });
    } catch (error) {
      console.error(error);
      const embedErroMinimo = new EmbedBuilder()
        .setColor(colors.yellow)
        .setAuthor({
          name: 'Não foi possível obter o avatar do usuário devido a um erro.',
          iconURL: emojis.icon_attention
        });

      return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
    }
  },
};
