const { EmbedBuilder } = require('discord.js');
const { logModerationAction } = require('@utils/moderationUtils');
const { colors, emojis } = require('@config');

module.exports = {
  name: 'clear',
  description: 'Apaga mensagens do chat, com suporte para apagar mensagens de um usuário específico.',
  usage: '${currentPrefix}clear <quantidade>',
  userPermissions: ['ManageMessages'],
  botPermissions: ['ManageMessages'],
  deleteMessage: true,
    
  async execute(message, args) {

    const quantidade = parseInt(args[0], 10);
    const usuario = message.mentions.users.first();

    if (!quantidade || isNaN(quantidade) || quantidade < 1 || quantidade > 100) {
      const embedErroMinimo = new EmbedBuilder()
        .setColor(colors.yellow)
        .setAuthor({
          name: 'Só é possível excluir de 1 a 100 mensagens por vez.',
          iconURL: emojis.icon_attention
        });
      
      return message.channel.send({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
    }

    try {
      const mensagens = await message.channel.messages.fetch({ limit: 100 });
      let mensagensParaApagar;

      if (usuario) {
        mensagensParaApagar = Array.from(
          mensagens.filter((msg) => msg.author.id === usuario.id && !msg.pinned).values()
        ).slice(0, quantidade);
      } else {
        mensagensParaApagar = Array.from(mensagens.filter((msg) => !msg.pinned).values()).slice(0, quantidade);
      }

      const apagadas = await message.channel.bulkDelete(mensagensParaApagar, true);

      logModerationAction(
        message.guild.id,
        message.author.id,
        'Clear',
        usuario ? usuario.id : 'N/A',
        `${apagadas.size} mensagens apagadas${usuario ? ` de ${usuario.tag}` : ''}`
      );

      const feedbackMessage = await message.channel.send(
        `<:1000042885:1336044571125354496> ${apagadas.size} mensagens foram apagadas ${
          usuario ? `de ${usuario}` : ''
        }.`
      );

      setTimeout(() => feedbackMessage.delete().catch(() => null), 4000);
    } catch (error) {
      console.error(error);
      const embedErroMinimo = new EmbedBuilder()
        .setColor(colors.yellow)
        .setAuthor({
          name: 'Não foi possível apagar as mensagens devido a um erro.',
          iconURL: emojis.icon_attention
        });
      
      return message.channel.send({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
    }
  },
};
