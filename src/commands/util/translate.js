'use strict';

const { EmbedBuilder } = require('discord.js');
const { translateText } = require('@utils/translate');
const { colors, emojis, langFlags } = require('@config');
const { sendEmbed } = require('@utils/embedReply');

module.exports = {
  name: 't',
  description: 'Traduz uma mensagem respondida para o idioma desejado.',
  usage: '${currentPrefix}t [idioma]',
  category: 'Utilidade',
  botPermissions: ['SendMessages', 'AddReactions'],
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

    try {
      const resultado = await translateText(replied.content, targetLang);

      const embed = new EmbedBuilder()
        .setTitle(`${emojis.trad} Tradução`)
        .setColor(colors.red)
        .addFields({ name: `Traduzido (${targetLang})`, value: resultado.slice(0, 1024) })
        .setFooter({
          text: message.author.username,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      await replied.reply({
        embeds: [embed],
        allowedMentions: { repliedUser: false },
      });
    } catch {
      return sendEmbed('yellow', message, 'Não foi possível traduzir a mensagem.');
    }

    const filter = (reaction, user) =>
      langFlags[reaction.emoji.name] &&
      !user.bot &&
      reaction.message.id === replied.id;

    const collector = replied.createReactionCollector({ filter, time: 60000 });

    collector.on('collect', async (reaction, user) => {
      const langCode = langFlags[reaction.emoji.name];
      if (!langCode) return;

      try {
        const resultado = await translateText(replied.content, langCode);

        const embed = new EmbedBuilder()
          .setTitle(`${emojis.trad} Tradução`)
          .setColor(colors.red)
          .addFields({ name: `Traduzido (${langCode})`, value: resultado.slice(0, 1024) })
          .setFooter({
            text: user.username,
            iconURL: user.displayAvatarURL({ dynamic: true }),
          })
          .setTimestamp();

        await replied.reply({
          embeds: [embed],
          allowedMentions: { repliedUser: false },
        });
      } catch {
        sendEmbed('yellow', message, `Erro ao traduzir usando a reação: ${reaction.emoji.name}`);
      }
    });

    for (const emoji of ['🇺🇸', '🇧🇷', '🇪🇸', '🇷🇺', '🇯🇵', '🇰🇷', '🇩🇪', '🇫🇷']) {
      if (langFlags[emoji]) {
        await replied.react(emoji).catch(() => null);
      }
    }
  },
};
