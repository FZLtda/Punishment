const { PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'clear',
  description: 'Apaga mensagens do chat, com suporte para apagar mensagens de um usuário específico.',
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return message.reply('<:no:1122370713932795997> Você não tem permissão para usar este comando.');
    }

    const quantidade = parseInt(args[0], 10);
    const usuario = message.mentions.users.first();

    if (!quantidade || isNaN(quantidade) || quantidade < 1 || quantidade > 100) {
      return message.reply('<:no:1122370713932795997> Por favor, forneça um número válido entre 1 e 100.');
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

      await message.channel.bulkDelete(mensagensParaApagar, true);

      const feedbackMessage = await message.channel.send(
        `<:emoji_33:1219788320234803250> ${mensagensParaApagar.length} mensagens foram apagadas ${
          usuario ? `de ${usuario}` : ''
        }`
      );

      setTimeout(() => feedbackMessage.delete(), 4000);
    } catch (error) {
      console.error(error);
      return message.reply('<:no:1122370713932795997> Ocorreu um erro ao tentar apagar as mensagens.');
    }
  },
};