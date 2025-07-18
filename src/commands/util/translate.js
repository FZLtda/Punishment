'use strict';

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
   * @param {import('discord.js').Message} message
   * @param {string[]} args
   */
  async execute(message, args) {
    const replied = message.reference?.messageId
      ? await message.channel.messages.fetch(message.reference.messageId).catch(() => null)
      : null;

    let targetLang = 'PT-BR';
    let content = '';

    const langRegex = /^[a-z]{2,3}([-_][A-Z]{2})?$/i;

    // Detecta idioma apenas se for informado e válido
    if (args.length > 0 && langRegex.test(args[0])) {
      targetLang = args.shift().replace('_', '-').toUpperCase();
    }

    content = replied?.content || args.join(' ');

    if (!content || content.trim().length === 0) {
      return sendEmbed('yellow', message, 'Responda uma mensagem de texto ou digite o texto a ser traduzido.');
    }

    try {
      const resultado = await translateText(content, targetLang);

      if (!resultado || typeof resultado !== 'string' || resultado.trim().length === 0) {
        return sendEmbed('yellow', message, 'Não foi possível traduzir o conteúdo.');
      }

      const embed = new EmbedBuilder()
        .setTitle(`${emojis.trad} Tradução`)
        .setColor(colors.red)
        .addFields({
          name: `Traduzido (${targetLang})`,
          value: resultado.slice(0, 1024),
        })
        .setFooter({
          text: message.author.username,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      const replyTarget = replied && !replied.reference ? replied : message;

      await replyTarget.reply({
        embeds: [embed],
        allowedMentions: { repliedUser: false },
      });
    } catch (err) {
      return sendEmbed('yellow', message, 'Não foi possível traduzir o conteúdo.');
    }
  },
};
