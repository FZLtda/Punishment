'use strict';

const { EmbedBuilder } = require('discord.js');
const { colors, emojis } = require('@config');
const { sendModLog } = require('@modules/modlog');

module.exports = {
  name: 'clear',
  description: 'Apaga mensagens do canal, com opção de filtrar por usuário.',
  usage: '${currentPrefix}clear <quantidade> [@usuário]',
  aliases: ['apagar', 'limpar'],
  userPermissions: ['ManageMessages'],
  botPermissions: ['ManageMessages'],
  deleteMessage: true,

  async execute(message, args) {
    const quantidade = parseInt(args[0], 10);
    const alvo = message.mentions.users.first();

    if (!quantidade || isNaN(quantidade) || quantidade < 1 || quantidade > 100) {
      return sendErro(message, 'Forneça um valor entre 1 e 100 para apagar mensagens.');
    }

    try {
      const mensagens = await message.channel.messages.fetch({ limit: 100 });

      const filtradas = mensagens.filter(msg => {
        const dentroLimite = (Date.now() - msg.createdTimestamp) < 14 * 24 * 60 * 60 * 1000;
        const correspondeAlvo = !alvo || msg.author.id === alvo.id;
        return correspondeAlvo && !msg.pinned && dentroLimite;
      });

      const mensagensParaApagar = Array.from(filtradas.values()).slice(0, quantidade);
      const apagadas = await message.channel.bulkDelete(mensagensParaApagar, true);

      const resposta = await message.channel.send({
        content: `${emojis.done} ${apagadas.size} mensagens foram apagadas${alvo ? ` de ${alvo}` : ''}.`,
        allowedMentions: { users: [] }
      });

      setTimeout(() => resposta.delete().catch(() => null), 4000);

      // Log da ação
      await sendModLog(message.guild, {
        action: 'Clear',
        moderator: message.author,
        channel: message.channel,
        extra: `${apagadas.size} mensagens apagadas${alvo ? ` de ${alvo.tag}` : ''}`
      });

    } catch (error) {
      console.error(error);
      return sendErro(message, 'Não foi possível apagar as mensagens devido a um erro.');
    }
  }
};

function sendErro(message, texto) {
  const embed = new EmbedBuilder()
    .setColor(colors.yellow)
    .setAuthor({ name: texto, iconURL: emojis.attentionIcon });

  return message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
}
