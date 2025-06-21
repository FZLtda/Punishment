const { EmbedBuilder } = require('discord.js');
require('dotenv').config()
const { colors, emojis } = require('@config');
const fetch = require('node-fetch');
;

module.exports = {
  name: 'gif',
  description: 'Busca e envia um GIF relacionado ao termo fornecido.',
  usage: '${currentPrefix}gif <termo>',
  userPermissions: ['SendMessages'],
  botPermissions: ['SendMessages'],
  deleteMessage: true,
  
  execute: async (message, args) => {
    const query = args.join(' ');

    if (!query) {
      const embedErroMinimo = new EmbedBuilder()
        .setColor(colors.yellow)
        .setAuthor({
          name: 'Você precisa fornecer um termo para buscar o GIF!',
          iconURL: emojis.icon_attention
        });

      return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
    }

    try {
      const apiKey = process.env.GIPHY_API_KEY;

      if (!apiKey) {
        const embedErroMinimo = new EmbedBuilder()
          .setColor(colors.yellow)
          .setAuthor({
            name: 'A chave da API do Giphy não foi configurada.',
            iconURL: emojis.icon_attention
          });

        return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
      }

      const response = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=1`
      );
      const data = await response.json();

      if (!data.data.length) {
        const embedErroMinimo = new EmbedBuilder()
          .setColor(colors.yellow)
          .setAuthor({
            name: 'Não encontrei nenhum GIF relacionado ao termo fornecido.',
            iconURL: emojis.icon_attention
          });

        return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
      }

      const gifUrl = data.data[0].images.original.url;

      const embed = new EmbedBuilder()
        .setColor(colors.red)
        .setTitle(`Resultado para: ${query}`)
        .setImage(gifUrl)
        .setFooter({ text: 'Punishment | Giphy' });

      message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Erro ao buscar GIF:', error);
      const embedErroMinimo = new EmbedBuilder()
        .setColor(colors.yellow)
        .setAuthor({
          name: 'Ocorreu um erro ao tentar buscar o GIF.',
          iconURL: emojis.icon_attention
        });

      return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
    }
  },
};
