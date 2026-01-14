'use strict';

const { bot, emojis } = require('@config');
const { sendWarning } = require('@embeds/embedWarning');
const TermsAgreement = require('@models/TermsAgreement');

module.exports = {
  name: 'termslist',
  description: 'Lista todos os usuários que aceitaram os Termos de Uso.',
  usage: '${currentPrefix}termslist',
  category: 'Administrador',
  deleteMessage: true,

  /**
   * Lista usuários que aceitaram os termos.
   * @param {import('discord.js').Message} message
   */
  async execute(message) {
    if (message.author.id !== bot.ownerId) return;

    const agreements = await TermsAgreement.find()
      .sort({ acceptedAt: -1 });

    if (!agreements.length) {
      return sendWarning(message, 'Nenhum usuário aceitou os Termos de Uso ainda.');
    }

    const lines = [];

    for (let index = 0; index < agreements.length; index++) {
      const { userId, acceptedAt } = agreements[index];

      const user =
        message.client.users.cache.get(userId) ||
        (await message.client.users.fetch(userId).catch(() => null));

      const displayName =
        user?.displayName ||
        user?.username ||
        'Usuário desconhecido';

      const timestamp = Math.floor(acceptedAt.getTime() / 1000);

      lines.push(
        `-# **${index + 1}.** ${emojis.done} ${displayName} (\`${userId}\`) — <t:${timestamp}:R>`
      );
    }

    return message.channel.send({
      content: [
        '📄 **Usuários que aceitaram os Termos de Uso:**',
        '',
        lines.join('\n'),
      ].join('\n'),
    });
  },
};
