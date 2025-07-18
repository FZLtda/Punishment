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

    const targetLang = args[0]?.toUpperCase();
    if (!targetLang)
      return sendEmbed('yellow', message, 'Você precisa informar o idioma de destino (ex: `pt-br`, `en`, `es`).');

    const inputText = replied?.content || args.slice(1).join(' ');

    if (!inputText)
      return sendEmbed('yellow', message, 'Responda uma mensagem de texto ou envie um texto para traduzir.');

    let resultado;
    try {
      resultado = await translateText(inputText, targetLang);
    } catch (err) {
      return sendEmbed('yellow', message, 'Não foi possível traduzir a mensagem.');
    }

    const embed = new EmbedBuilder()
      .setTitle(`${emojis.trad} Tradução`)
      .setColor(colors.red)
      .addFields({ name: `Traduzido (${targetLang})`, value: resultado.slice(0, 1024) })
      .setFooter({
        text: message.author.username,
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      })
      .setTimestamp();

    const replyTarget = replied || message;

    return replyTarget
      .reply({ embeds: [embed], allowedMentions: { repliedUser: false } })
      .catch(() => sendEmbed('yellow', message, 'Não foi possível enviar a tradução.'));
  },
};
