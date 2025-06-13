const { EmbedBuilder } = require('discord.js');
const { yellow, red } = require('../config/colors.json');
const { icon_attention } = require('../config/emoji.json');
const axios = require('axios');
require('dotenv').config();

module.exports = {
  name: 'github',
  description: 'Busca informações detalhadas sobre um repositório do GitHub.',
  usage: '${currentPrefix}github <usuário/repositório>',
  userPermissions: ['SendMessages'],
  botPermissions: ['SendMessages'],
  deleteMessage: true,
  
  async execute(message, args) {
    if (!args[0] || typeof args[0] !== 'string') {
      const embedErroMinimo = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({
          name: 'Você precisa fornecer o repositório no formato `usuário/repositório`',
          iconURL: icon_attention
        });

      return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
    }

    const repo = args[0].trim();
    const githubToken = process.env.GITHUB_TOKEN;
    const apiUrl = `https://api.github.com/repos/${repo}`;

    try {
      console.log(`[DEBUG] Buscando repositório: ${repo}`);

      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: githubToken ? `Bearer ${githubToken}` : undefined,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      const data = response.data;

      const embed = new EmbedBuilder()
        .setTitle(`Repositório: ${data.full_name}`)
        .setURL(data.html_url)
        .setColor(red)
        .setDescription(data.description || 'Sem descrição disponível.')
        .addFields(
          { name: 'Autor', value: `[${data.owner.login}](${data.owner.html_url})`, inline: true },
          { name: 'Estrelas', value: `${data.stargazers_count}`, inline: true },
          { name: 'Forks', value: `${data.forks_count}`, inline: true },
          { name: 'Issues Abertas', value: `${data.open_issues_count}`, inline: true },
          { name: 'Linguagem', value: data.language || 'Não especificada', inline: true },
          { name: 'Criado em', value: new Date(data.created_at).toLocaleDateString('pt-BR'), inline: true },
          { name: 'Última Atualização', value: new Date(data.updated_at).toLocaleDateString('pt-BR'), inline: true }
        )
        .setThumbnail(data.owner.avatar_url)
        .setFooter({
          text: `${message.author.username}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(`[ERROR] Falha ao buscar repositório: ${repo}`, error.response?.data || error.message);

      if (error.response) {
        const status = error.response.status;

        if (status === 404) {
          const embedErroMinimo = new EmbedBuilder()
            .setColor(yellow)
            .setAuthor({
              name: 'Repositório não encontrado. Verifique o nome e tente novamente.',
              iconURL: icon_attention
            });

          return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
        }

        if (status === 403) {
          const embedErroMinimo = new EmbedBuilder()
            .setColor(yellow)
            .setAuthor({
              name: 'Limite de requisições da API do GitHub excedido. Tente novamente mais tarde.',
              iconURL: icon_attention
            });

          return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
        }
      }
      const embedErroMinimo = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({
          name: 'Ocorreu um erro ao buscar informações do repositório.',
          iconURL: icon_attention
        });

      return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
    }
  },
};
