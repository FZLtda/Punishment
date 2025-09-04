'use strict';

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { colors, emojis, bot } = require('@config');
const { sendWarning } = require('@embeds/embedWarning');

module.exports = {
  name: 'sugestao',
  description: 'Abre o painel do sistema de sugestões.',
  usage: '${currentPrefix}sugestao',
  userPermissions: [],
  botPermissions: [],
  deleteMessage: true,

  /**
   * Executa o comando sugestao
   * @param {import('discord.js').Message} message
   * @param {string[]} args
   */
  async execute(message, args) {
    const client = message.client;
    const suggestionsChannel = process.env.SUGGESTIONS_CHANNEL;

    if (!suggestionsChannel) {
      return sendWarning(message, 'O canal de sugestões não está configurado no `.env`.');
    }

    const embed = new EmbedBuilder()
      .setTitle(`${emojis.idea} Sistema de Sugestões`)
      .setDescription(
        `📌 Escolha uma opção abaixo:\n\n` +
        `📝 **Fazer Sugestão** – Envie sua ideia diretamente.\n` +
        `📂 **Ver Sugestões** – Acesse o canal de sugestões e veja o que já foi enviado.`
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
