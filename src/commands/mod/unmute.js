const { EmbedBuilder } = require('discord.js');
const { colors, emojis } = require('@config');

module.exports = {
  name: 'unmute',
  description: 'Remove o mute (timeout) de um membro.',
  usage: '${currentPrefix}unmute <@usuário> [motivo]',
  userPermissions: ['ModerateMembers'],
  botPermissions: ['ModerateMembers'],
  deleteMessage: true,

  async execute(message, args) {
    const membro =
      message.mentions.members.first() || message.guild.members.cache.get(args[0]);

    if (!membro) {
      return sendErro(message, 'Mencione um usuário para executar esta ação.');
    }

    if (!membro.communicationDisabledUntilTimestamp) {
      return sendErro(message, 'Este usuário não está silenciado no momento.');
    }

    try {
      await membro.timeout(null);

      const embedSucesso = new EmbedBuilder()
        .setTitle('Punição removida')
        .setColor(colors.green)
        .setDescription(`${membro} (\`${membro.id}\`) teve o mute removido com sucesso.`)
        .setThumbnail(membro.user.displayAvatarURL({ dynamic: true }))
        .setFooter({
          text: `${message.author.username}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      return message.channel.send({ embeds: [embedSucesso] });
    } catch (error) {
      console.error(error);
      return sendErro(message, 'Não foi possível remover o mute do usuário devido a um erro inesperado.');
    }
  }
};

function sendErro(message, texto) {
  const embedErro = new EmbedBuilder()
    .setColor(colors.yellow)
    .setAuthor({ name: texto, iconURL: emojis.attention });

  return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
}
