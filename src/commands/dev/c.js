'use strict';

const { emojis, bot } = require('@config');
const { sendModLog } = require('@modules/modlog');
const { sendWarning } = require('@embeds/embedWarning');

module.exports = {
  name: 'c',
  description: 'Apaga rapidamente 100 mensagens do canal.',
  usage: '${currentPrefix}c',
  aliases: ['clear100', 'limpar100'],
  userPermissions: ['ManageMessages'],
  botPermissions: ['ManageMessages'],
  deleteMessage: true,

  async execute(message) {
    if (message.author.id !== bot.ownerId) return;
    
    try {
      const mensagens = await message.channel.messages.fetch({ limit: 100 });

      const filtradas = mensagens.filter(msg => {
        const dentroLimite = (Date.now() - msg.createdTimestamp) < 14 * 24 * 60 * 60 * 1000;
        return !msg.pinned && dentroLimite;
      });

      const mensagensParaApagar = Array.from(filtradas.values()).slice(0, 100);
      const apagadas = await message.channel.bulkDelete(mensagensParaApagar, true);

      const resposta = await message.channel.send({
        content: `${emojis.done} ${apagadas.size} mensagens foram apagadas.`,
        allowedMentions: { users: [] }
      });

      setTimeout(() => resposta.delete().catch(() => null), 4000);

      await sendModLog(message.guild, {
        action: 'Clear (Rápido)',
        moderator: message.author,
        channel: message.channel,
        extra: `${apagadas.size} mensagens apagadas com atalho`
      });

    } catch (error) {
      console.error(error);
      return sendWarning(message, 'Não foi possível apagar as mensagens devido a um erro.');
    }
  }
};
