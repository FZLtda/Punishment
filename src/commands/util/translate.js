'use strict';

/**
 * Comando: t
 * Descrição: Traduz uma mensagem respondida ou um texto direto fornecido para o idioma especificado.
 * Uso:
 *   - .t en -> traduz a mensagem respondida para inglês
 *   - .t en Olá mundo -> traduz o texto "Olá mundo" para inglês
 *   - .t -> traduz a mensagem respondida para PT-BR (padrão)
 *
 * Observações:
 * - Caso o idioma não seja informado, será assumido como 'PT-BR'.
 * - Suporta códigos como 'EN', 'PT-BR', 'ES', etc.
 */

const { EmbedBuilder } = require('discord.js');
const { translateText } = require('@utils/translate');
const { colors, emojis } = require('@config');
const { sendEmbed } = require('@utils/embedReply');

module.exports = {
  name: 't',
  description: 'Traduz uma mensagem respondida ou um texto para o idioma desejado.',
  usage: '${currentPrefix}t [idioma] (texto)',
  category: 'Utilidade',
  botPermissions: ['SendMessages'],
  deleteMessage: true,

  /**
   * Executa o comando de tradução.
   * @param {import('discord.js').Message} message - Mensagem que executou o comando
   * @param {string[]} args - Argumentos fornecidos no comando
   */
  async execute(message, args) {
    const repliedMessage = message.reference?.messageId
      ? await message.channel.messages.fetch(message.reference.messageId).catch(() => null)
      : null;

    let targetLang = 'PT-BR';
    let textToTranslate = '';

    const langRegex = /^[a-z]{2,3}([-_][A-Z]{2})?$/i;

    if (args.length > 0 && langRegex.test(args[0])) {
      targetLang = args.shift().replace('_', '-').toUpperCase();
    }

    textToTranslate = repliedMessage?.content || args.join(' ');

    if (!textToTranslate || textToTranslate.trim().length === 0) {
      return sendEmbed('yellow', message, 'Responda uma mensagem de texto ou digite o texto a ser traduzido.');
    }

    try {
      const result = await translateText(textToTranslate, targetLang);

      if (!result || typeof result !== 'string' || result.trim().length === 0) {
        return sendEmbed('yellow', message, 'Não foi possível traduzir o conteúdo.');
      }

      const translationEmbed = new EmbedBuilder()
        .setTitle(`${emojis.trad} Tradução`)
        .setColor(colors.red)
        .addFields({
          name: `Traduzido (${targetLang})`,
          value: result.slice(0, 1024),
        })
        .setFooter({
          text: message.author.username,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      const destination = repliedMessage || message.channel;

      await destination.send({
        embeds: [translationEmbed],
        allowedMentions: { repliedUser: false },
      });
    } catch (error) {
      return sendEmbed('yellow', message, 'Não foi possível traduzir o conteúdo.');
    }
  },
};
