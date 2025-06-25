'use strict';

const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { logModerationAction } = require('@utils/moderationUtils');
const { colors, emojis } = require('@config');

module.exports = {
  name: 'clear',
  description: 'Apaga mensagens do canal, com opção de filtrar por usuário.',
  usage: '${currentPrefix}clear <quantidade> [@usuário]',
  category: 'Moderação',
  userPermissions: ['ManageMessages'],
  botPermissions: ['ManageMessages'],
  deleteMessage: true,

  /**
   * Executa o comando de limpeza.
   * @param {import('discord.js').Message} message
   * @param {string[]} args
   */
  async execute(message, args) {
    const quantidade = parseInt(args[0], 10);
    const usuario = message.mentions.users.first();

    if (isNaN(quantidade) || quantidade < 1 || quantidade > 100) {
      const embedErro = new EmbedBuilder()
        .setColor(colors.yellow)
        .setAuthor({
          name: 'Só é possível excluir de 1 a 100 mensagens por vez.',
          iconURL: emojis.icon_attention
        });

      return message.channel.send({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }

    try {
      const mensagens = await message.channel.messages.fetch({ limit: 100 });
      let mensagensParaApagar = mensagens.filter((msg) => !msg.pinned);

      if (usuario) {
        mensagensParaApagar = mensagensParaApagar.filter((msg) => msg.author.id === usuario.id);
      }

      const mensagensSelecionadas = mensagensParaApagar.first(quantidade);

      const apagadas = await message.channel.bulkDelete(mensagensSelecionadas, true);

      await logModerationAction(
        message.guild.id,
        message.author.id,
        'Clear',
        usuario?.id || 'N/A',
        `${apagadas.size} mensagens apagadas${usuario ? ` de ${usuario.tag}` : ''}`
      );

      const feedback = await message.channel.send({
        content: `🧹 ${apagadas.size} mensagens foram apagadas${usuario ? ` de ${usuario}` : ''}.`,
        allowedMentions: { repliedUser: false }
      });

      setTimeout(() => feedback.delete().catch(() => null), 4000);
    } catch (error) {
      console.error('[Clear Command] Erro ao tentar apagar mensagens:', error);

      const embedErro = new EmbedBuilder()
        .setColor(colors.red)
        .setAuthor({
          name: 'Não foi possível apagar as mensagens devido a um erro.',
          iconURL: emojis.icon_error
        });

      return message.channel.send({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }
  },
};
