'use strict';

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { emojis, colors, bot } = require('@config');

module.exports = {
  name: 'sugestao',
  description: 'Abre o painel do sistema de sugestões',

  /**
   * Executa o comando sugestao
   * @param {import('discord.js').Message} message
   * @param {import('discord.js').Client} client
   */
  async run(client, message) {
    const suggestionsChannel = process.env.SUGGESTIONS_CHANNEL;
    if (!suggestionsChannel) {
      return message.reply(`${emojis.error} O canal de sugestões não está configurado no .env.`);
    }

    const embed = new EmbedBuilder()
      .setTitle(`${emojis.idea} Sistema de Sugestões`)
      .setDescription(
        `📌 Escolha uma opção abaixo:\n\n` +
        `📝 **Fazer Sugestão** – Envie sua ideia para o canal de sugestões.\n` +
        `📂 **Ver Sugestões** – Veja todas as ideias já enviadas pela comunidade.`
      )
      .setColor(colors.primary)
      .setFooter({ text: bot.name, iconURL: client.user.displayAvatarURL() });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('suggestion_make')
        .setLabel('Fazer Sugestão')
        .setEmoji('📝')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setLabel('Ver Sugestões')
        .setEmoji('📂')
        .setStyle(ButtonStyle.Link)
        .setURL(`https://discord.com/channels/${message.guild.id}/${suggestionsChannel}`)
    );

    return message.channel.send({ embeds: [embed], components: [row] });
  }
};
