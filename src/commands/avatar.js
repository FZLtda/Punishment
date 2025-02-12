const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'avatar',
  description: 'Exibe o avatar de um usuário.',
  usage: '${currentPrefix}avatar [<@usuário>]',
  permissions: 'Enviar Mensagens',
  async execute(message, args) {
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

      await message.reply({ embeds: [avatarEmbed], allowedMentions: { repliedUser: false } });
    } catch (error) {
      console.error(error);
      const embedErroMinimo = new EmbedBuilder()
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Não foi possível obter o avatar do usuário devido a um erro.',
          iconURL: 'http://bit.ly/4aIyY9j'
      });

  return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
    }
  },
};
