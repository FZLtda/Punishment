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

    const langRegex = /^[a-z]{2,3}(-[A-Z]{2})?$/i;
    const targetLang = langRegex.test(args[0]) ? args.shift().toUpperCase() : 'PT-BR';

    const conteudo = replied?.content || args.join(' ');

    if (!conteudo)
      return sendEmbed('yellow', message, 'Responda uma mensagem de texto ou digite o texto a ser traduzido.');

    let resultado;
    try {
      resultado = await translateText(conteudo, targetLang);
    } catch {
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

    try {
      if (replied && !replied.reference) {
        await replied.reply({
          embeds: [embed],
          allowedMentions: { repliedUser: false },
        });
      } else {
        await message.reply({
          embeds: [embed],
          allowedMentions: { repliedUser: false },
        });
      }
    } catch (err) {
      return sendEmbed('yellow', message, 'Não foi possível enviar a tradução.');
    }
  }
};
