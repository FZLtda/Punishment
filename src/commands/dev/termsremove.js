'use strict';

const { bot, emojis } = require('@config');
const { sendWarning } = require('@embeds/embedWarning');
const TermsAgreement = require('@models/TermsAgreement');

module.exports = {
  name: 'termsremove',
  description: 'Remove os dados de aceite dos Termos de Uso de um usuário.',
  usage: '${currentPrefix}termsremove <userId>',
  category: 'Administrador',
  deleteMessage: true,

  /**
   * Remove o aceite de termos de um usuário específico.
   * @param {import('discord.js').Message} message
   * @param {string[]} args
   */
  async execute(message, args) {
    if (message.author.id !== bot.ownerId) return;

    const userId = args[0];
    if (!userId) {
      return sendWarning(message, 'Você precisa informar o ID do usuário.');
    }

    const deleted = await TermsAgreement.findOneAndDelete({ userId });

    if (!deleted) {
      return sendWarning(
        message,
        'Nenhum registro de aceite de termos foi encontrado para este usuário.'
      );
    }

    const user =
      message.client.users.cache.get(userId) ||
      (await message.client.users.fetch(userId).catch(() => null));

    const displayName = user
      ? user.displayName || user.username
      : 'Usuário desconhecido';

    return message.channel.send({
      content: `${emojis.done} Registro de consentimento excluído para **${displayName}** (\`${userId}\`)`,
    });
  },
};
