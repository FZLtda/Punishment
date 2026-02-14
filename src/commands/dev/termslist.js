'use strict';

const { AttachmentBuilder }  = require('discord.js');
const { bot, emojis }        = require('@config');
const { sendWarning }        = require('@embeds/embedWarning');
const TermsAgreement         = require('@models/TermsAgreement');

module.exports = {
  name: 'termslist',
  description: 'Exporta em TXT todos os usuários que aceitaram os Termos de Uso.',
  usage: '${currentPrefix}termslist',
  category: 'Administrador',
  deleteMessage: true,

  /**
   * @param {import('discord.js').Message} message
   */
  async execute(message) {
    if (message.author.id !== bot.ownerId) return;

    try {
      const agreements = await TermsAgreement
        .find({}, { userId: 1, acceptedAt: 1 })
        .sort({ acceptedAt: -1 })
        .lean()
        .exec();

      if (!agreements?.length) {
        return sendWarning(
          message,
          'Nenhum usuário aceitou os Termos de Uso ainda.'
        );
      }

      const content  = await this.buildFileContent(
        message.client,
        agreements
      );

      const buffer   = Buffer.from(content, 'utf-8');
      const fileName = `punishment-terms-${Date.now()}.txt`;

      const attachment = new AttachmentBuilder(buffer, {
        name: fileName
      });

      await message.channel.send({
        content: `${emojis.done} Exportação concluída!`,
        files:   [attachment],
      });

    } catch (error) {
      console.error('[TERMSLIST_EXPORT_ERROR]', error);

      return sendWarning(
        message,
        'Erro interno ao exportar os termos.'
      );
    }
  },

  /**
   * Gera o conteúdo do TXT com Display Name + ID
   * @param {import('discord.js').Client} client
   * @param {Array<{ userId: string, acceptedAt: Date }>} agreements
   */
  async buildFileContent(client, agreements) {
    const lines = [];

    lines.push('========================================');
    lines.push('          TERMS AGREEMENTS EXPORT       ');
    lines.push('========================================');
    lines.push(`Usuários: ${agreements.length}`);
    lines.push(`Gerado em: ${new Date().toISOString()}`);
    lines.push('========================================');
    lines.push('');

    for (let i = 0; i < agreements.length; i++) {
      const { userId, acceptedAt } = agreements[i];

      let user = client.users.cache.get(userId);

      if (!user) {
        user = await client.users
          .fetch(userId)
          .catch(() => null);
      }

      const displayName =
        user?.globalName ||
        user?.username   ||
        'Usuário desconhecido';

      const acceptedDate = new Date(acceptedAt).toISOString();

      lines.push(`[${i + 1}]`);
      lines.push(`Display Name : ${displayName}`);
      lines.push(`User ID      : ${userId}`);
      lines.push(`Accepted At  : ${acceptedDate}`);
      lines.push('----------------------------------------');
    }

    return lines.join('\n');
  },
};
