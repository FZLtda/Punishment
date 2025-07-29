'use strict';

const { EmbedBuilder } = require('discord.js');
const { translateText } = require('@utils/translate');
const { colors, emojis } = require('@config');
const { sendWarning } = require('@utils/embedWarning');

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

    if (args.length > 0 && langRegex.test(args[0])) {
      targetLang = args.shift().replace('_', '-').toUpperCase();
    }

    content = replied?.content || args.join(' ');

    if (!content || content.trim().length === 0) {
      return sendWarning(message, 'Responda uma mensagem de texto ou digite o texto a ser traduzido.');
    }

    try {
      const resultado = await translateText(content, targetLang);

      if (!resultado || typeof resultado !== 'string' || resultado.trim().length === 0) {
        return sendWarning(message, 'Não foi possível traduzir o conteúdo.');
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

      if (replied) {
        await replied.reply({
          embeds: [embed],
          allowedMentions: { repliedUser: false },
        });
      } else {
        await message.channel.send({
          embeds: [embed],
          allowedMentions: { repliedUser: false },
        });
      }
    } catch (error) {
      return sendWarning(message, 'Não foi possível traduzir o conteúdo.');
    }
  },
};
