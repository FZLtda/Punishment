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

      const content = await this.buildFileContent(
        message.client,
        agreements
      );

      const buffer = Buffer.from('\uFEFF' + content, 'utf-8');

      const attachment = new AttachmentBuilder(buffer, {
        name: `punishment-terms-${Date.now()}.txt`
      });

      await message.channel.send({
        content: `${emojis.done} Exportação concluída!`,
        files: [attachment],
      });

    } catch (error) {
      console.error('[TERMSLIST_EXPORT_ERROR]', error);

      return sendWarning(
        message,
        'Erro interno ao exportar os termos.'
      );
    }
  },

  async buildFileContent(client, agreements) {
    const lines = [];

    const nowFormatted = new Date().toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo'
    });

    lines.push('========================================');
    lines.push('          TERMS AGREEMENTS EXPORT       ');
    lines.push('========================================');
    lines.push(`Usuários: ${agreements.length}`);
    lines.push(`Gerado em: ${nowFormatted}`);
    lines.push('========================================');
    lines.push('');

    for (let i = 0; i < agreements.length; i++) {
      const { userId, acceptedAt } = agreements[i];

      let user = client.users.cache.get(userId);
      if (!user) {
        user = await client.users.fetch(userId).catch(() => null);
      }

      const displayName =
        user?.globalName ||
        user?.username   ||
        'Usuário desconhecido';

      const acceptedDate = acceptedAt
        ? new Date(acceptedAt).toLocaleString('pt-BR', {
            timeZone: 'America/Sao_Paulo'
          })
        : 'Data não registrada';

      lines.push(`[${i + 1}]`);
      lines.push(`Display Name : ${displayName}`);
      lines.push(`User ID      : ${userId}`);
      lines.push(`Accepted At  : ${acceptedDate}`);
      lines.push('----------------------------------------');
    }

    return lines.join('\n');
  },
};
