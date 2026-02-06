'use strict';

const { bot } = require('@config');
const { sendWarning } = require('@embeds/embedWarning');

module.exports = {
  name: 'user',
  description: 'Retorna o ID do usuário mencionado ou de quem executou o comando.',
  usage: '${currentPrefix}user [@usuário]',
  category: 'Administrador',
  deleteMessage: true,

  /**
   * Retorna o ID de um usuário.
   * @param {import('discord.js').Message} message
   * @param {string[]} args
   */
  async execute(message, args) {
    if (message.author.id !== bot.ownerId) return;

    const targetUser =
      message.mentions.users.first() ||
      message.client.users.cache.get(args[0]) ||
      message.author;

    if (!targetUser) {
      return sendWarning(message, 'Não foi possível identificar o usuário.');
    }

    await message.channel.send({
      content: `\`${targetUser.id}\``,
    });
  },
};
