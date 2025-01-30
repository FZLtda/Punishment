const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');
require('dotenv').config();

module.exports = {
  name: 'gif',
  description: 'Busca e envia um GIF relacionado ao termo fornecido.',
  usage: '!gif [termo]',
  execute: async (message, args) => {
    const query = args.join(' ');

    if (!query) {
      return message.reply('<:no:1122370713932795997> Você precisa fornecer um termo para buscar o GIF!');
    }

    try {
      const apiKey = process.env.GIPHY_API_KEY;

      if (!apiKey) {
        return message.reply('<:no:1122370713932795997> A chave da API do Giphy não foi configurada.');
      }

      const response = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=1`
      );
      const data = await response.json();

      if (!data.data.length) {
        return message.reply('<:no:1122370713932795997> Não encontrei nenhum GIF relacionado ao termo fornecido.');
      }

      const gifUrl = data.data[0].images.original.url;

      const embed = new EmbedBuilder()
        .setColor('#fe3838')
        .setTitle(`Resultado para: ${query}`)
        .setImage(gifUrl)
        .setFooter({ text: 'Powered by Giphy' });

      message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Erro ao buscar GIF:', error);
      message.reply('<:no:1122370713932795997> Ocorreu um erro ao tentar buscar o GIF.');
    }
  },
};
