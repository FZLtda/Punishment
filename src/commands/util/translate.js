'use strict';

const { EmbedBuilder } = require('discord.js');
const translateText = require('@modules/translateText');
const { colors, emojis, langFlags } = require('@config');

/**
 * Comando de tradução de texto utilizando a API do DeepL.
 */
module.exports = {
  name: 'translate',
  description: 'Traduz um texto para o idioma selecionado.',
  aliases: ['traduzir'],
  usage: '<texto>',
  category: 'util',
  
  async execute(message, args) {
    const flag = message?.mentions?.repliedUser?.emoji || args[0];
    const targetLang = langFlags[flag];

    if (!targetLang) {
      return message.reply({
        content: `${emojis.error} Por favor, forneça uma bandeira de idioma válida.`,
        allowedMentions: { repliedUser: false }
      });
    }

    const text = args.slice(1).join(' ');
    if (!text) {
      return message.reply({
        content: `${emojis.error} Forneça o texto que deseja traduzir.`,
        allowedMentions: { repliedUser: false }
      });
    }

    try {
      const translated = await translateText(text, targetLang);
      const embed = new EmbedBuilder()
        .setTitle(`${emojis.translate} Tradução`)
        .addFields(
          { name: 'Texto original', value: `\`\`\`${text}\`\`\`` },
          { name: 'Traduzido', value: `\`\`\`${translated}\`\`\`` }
        )
        .setColor(colors.blue)
        .setFooter({ text: `Idioma: ${targetLang}` });

      await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });

    } catch (err) {
      console.error(err);
      return message.reply({
        content: `${emojis.error} Ocorreu um erro ao traduzir o texto.`,
        allowedMentions: { repliedUser: false }
      });
    }
  }
};
