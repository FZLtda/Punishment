'use strict';

const { AttachmentBuilder } = require('discord.js');
const GlobalBan             = require('@models/GlobalBan');
const { sendWarning }       = require('@embeds/embedWarning');
const { bot, emojis }       = require('@config');

module.exports = {
  name: 'violations',
  description: 'Exporta em TXT todos os usuários banidos globalmente.',
  usage: '${currentPrefix}violations',
  deleteMessage: true,

  /**
   * @param {import('discord.js').Message} message
   */
  async execute(message) {
    if (message.author.id !== bot.ownerId) return;

    try {
      const bans = await GlobalBan
        .find({}, { userId: 1, bannedBy: 1, reason: 1, bannedAt: 1 })
        .sort({ bannedAt: -1 })
        .lean()
        .exec();

      if (!bans?.length) {
        return sendWarning(
          message,
          'Não há usuários banidos globalmente no momento.'
        );
      }

      const content  = await this.buildFileContent(message.client, bans);

      const buffer   = Buffer.from('\uFEFF' + content, 'utf-8');

      const fileName = `punishment-violations-${Date.now()}.txt`;

      const attachment = new AttachmentBuilder(buffer, {
        name: fileName
      });

      await message.channel.send({
        content: `${emojis.done} Exportação concluída!`,
        files:   [attachment],
      });

    } catch (error) {
      console.error('[VIOLATIONS_EXPORT_ERROR]', error);

      return sendWarning(
        message,
        'Erro interno ao exportar as violações.'
      );
    }
  },

  /**
   * @param {import('discord.js').Client} client
   * @param {Array<{ userId: string, bannedBy: string, reason: string, bannedAt: Date }>} bans
   */
  async buildFileContent(client, bans) {
    const lines = [];

    const nowFormatted = new Date().toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo'
    });

    lines.push('========================================');
    lines.push('           GLOBAL BAN EXPORT            ');
    lines.push('========================================');
    lines.push(`Banimentos: ${bans.length}`);
    lines.push(`Gerado em: ${nowFormatted}`);
    lines.push('========================================');
    lines.push('');

    for (let i = 0; i < bans.length; i++) {
      const { userId, bannedBy, reason, bannedAt } = bans[i];

      let bannedUser = client.users.cache.get(userId);
      if (!bannedUser) {
        bannedUser = await client.users.fetch(userId).catch(() => null);
      }

      let authorUser = client.users.cache.get(bannedBy);
      if (!authorUser) {
        authorUser = await client.users.fetch(bannedBy).catch(() => null);
      }

      const bannedName =
        bannedUser?.globalName ||
        bannedUser?.username   ||
        'Usuário não encontrado';

      const authorName =
        authorUser?.globalName ||
        authorUser?.username   ||
        'Desconhecido';

      const dateFormatted = bannedAt
        ? new Date(bannedAt).toLocaleString('pt-BR', {
            timeZone: 'America/Sao_Paulo'
          })
        : 'Data não registrada';

      lines.push(`[${i + 1}]`);
      lines.push(`Usuário Banido : ${bannedName}`);
      lines.push(`User ID        : ${userId}`);
      lines.push(`Motivo         : ${reason || 'Não especificado'}`);
      lines.push(`Banido Por     : ${authorName}`);
      lines.push(`Autor ID       : ${bannedBy}`);
      lines.push(`Data           : ${dateFormatted}`);
      lines.push('----------------------------------------');
    }

    return lines.join('\n');
  },
};
