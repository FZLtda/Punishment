'use strict';

const { ChannelType } = require('discord.js');
const { bot } = require('@config');
const { sendWarning } = require('@embeds/embedWarning');

module.exports = {
  name: 'reply',
  description: 'Responde uma mensagem específica pelo ID, mesmo que esteja em outro canal.',
  usage: '${currentPrefix}reply <id_mensagem> <conteúdo>',
  category: 'Administrador',
  deleteMessage: true,

  /**
   * Responde uma mensagem pelo ID, buscando em todos os canais do servidor.
   * @param {import('discord.js').Message} message
   * @param {string[]} args
   */

  async execute(message, args) {
    if (message.author.id !== bot.ownerId) return;

    const messageId = args[0];
    if (!messageId)
      return sendWarning(message, 'Você precisa informar o ID da mensagem.');

    const replyContent = args.slice(1).join(' ');
    if (!replyContent)
      return sendWarning(message, 'Você precisa informar o conteúdo da resposta.');

    try {
      await message.guild.channels.fetch();

      let targetMessage = null;

      const textChannels = message.guild.channels.cache.filter(
        channel =>
          channel.type === ChannelType.GuildText ||
          channel.type === ChannelType.GuildAnnouncement ||
          channel.type === ChannelType.PublicThread ||
          channel.type === ChannelType.PrivateThread
      );

      for (const [, channel] of textChannels) {
        try {
          const fetched = await channel.messages.fetch(messageId);
          if (fetched) {
            targetMessage = fetched;
            break;
          }
        } catch {
          continue;
        }
      }

      if (!targetMessage)
        return sendWarning(message, 'Mensagem não encontrada em nenhum canal do servidor.');

      await targetMessage.reply({
        content: replyContent,
        allowedMentions: { repliedUser: false }
      });

    } catch (error) {
      console.error('[reply] Erro ao responder mensagem:', error);
      return sendWarning(message, 'Não foi possível responder a mensagem.');
    }
  }
};
