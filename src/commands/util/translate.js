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
  botPermissions: ['SendMessages', 'AddReactions', 'ReadMessageHistory'],
  deleteMessage: true,

  /**
   * Executa o comando de tradução.
   * @param {import('discord.js').Message} message
   * @param {string[]} args
   */
  async execute(message, args) {
    // Mensagem respondida
    const replied = message.reference?.messageId
      ? await message.channel.messages.fetch(message.reference.messageId).catch(() => null)
      : null;

    if (!replied || !replied.content)
      return sendEmbed('yellow', message, 'Responda uma mensagem de texto para traduzi-la.');

    // Tradução por argumento
    if (args[0]) {
      const targetLang = args[0].toUpperCase();

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

        return await replied.reply({
          embeds: [embed],
          allowedMentions: { repliedUser: false },
        });
      } catch {
        return sendEmbed('yellow', message, 'Não foi possível traduzir a mensagem.');
      }
    }

    // Tradução por reação - instruções para usuário
    const infoMsg = await message.reply({
      content: 'Reaja na mensagem original com uma bandeira para traduzir.',
      allowedMentions: { repliedUser: false },
    });

    // Adiciona as reações na mensagem respondida
    const flagsToReact = Object.keys(langFlags);
    for (const flag of flagsToReact) {
      await replied.react(flag).catch(() => null);
    }

    // Cria coletor na mensagem respondida
    const collector = replied.createReactionCollector({
      filter: (reaction, user) =>
        !user.bot && flagsToReact.includes(reaction.emoji.name),
      time: 60_000,
      dispose: true,
    });

    collector.on('collect', async (reaction, user) => {
      const lang = langFlags[reaction.emoji.name];
      if (!lang) return;

      try {
        const resultado = await translateText(replied.content, lang);

        const embed = new EmbedBuilder()
          .setTitle(`${emojis.trad} Tradução`)
          .setColor(colors.red)
          .addFields({ name: `Traduzido (${lang})`, value: resultado.slice(0, 1024) })
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
        await sendEmbed('yellow', message, `Erro ao traduzir para ${lang}.`);
      }
    });

    collector.on('end', () => {
      infoMsg.delete().catch(() => {});
    });
  },
};
