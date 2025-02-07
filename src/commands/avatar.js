const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'avatar',
  description: 'Exibe o avatar de um usuário.',
  usage: 'avatar [<@usuário>]',
  permissions: 'SendMessages',
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

      await message.reply({ embeds: [avatarEmbed] });
    } catch (error) {
      console.error(error);
      message.reply('<:no:1122370713932795997> Ocorreu um erro ao tentar exibir o avatar.');
    }
  },
};
