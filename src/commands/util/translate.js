'use strict';

const { EmbedBuilder } = require('discord.js');
const { translateText } = require('@utils/translate');
const { colors, emojis } = require('@config');
const { sendEmbed } = require('@utils/embedReply');

module.exports = {
  name: 't',
  description: 'Traduz uma mensagem respondida para o idioma desejado.',
  usage: '${currentPrefix}t [idioma]',
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

    if (!replied || !replied.content)
      return sendEmbed('yellow', message, 'Responda uma mensagem de texto para traduzi-la.');

    const targetLang = args[0]?.toUpperCase() || 'PT-BR';

    const statusMsg = await message.reply(`${emojis.check} Traduzindo mensagem...`);

    let resultado;
    try {
      resultado = await translateText(replied.content, targetLang);
    } catch (err) {
      await statusMsg.delete().catch(() => null);
      return sendEmbed('yellow', message, 'Não foi possível traduzir a mensagem.');
    }

    const embed = new EmbedBuilder()
      .setTitle(`${emojis.translate || '🌐'} Tradução`)
      .setColor(colors.red)
      .addFields(
        { name: 'Original', value: replied.content.slice(0, 1024) },
        { name: `Traduzido (${targetLang})`, value: resultado.slice(0, 1024) }
      )
      .setFooter({
        text: message.author.username,
        iconURL: message.author.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();

    return statusMsg.edit({ content: null, embeds: [embed] });
  }
};
