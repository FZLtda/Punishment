const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

module.exports = {
  name: 'github',
  description: 'Busca informações detalhadas sobre um repositório do GitHub.',
  usage: 'github <usuário/repositório>',
  permissions: 'Nenhuma',
  async execute(message, args) {
    if (!args[0] || typeof args[0] !== 'string') {
      const embedErroMinimo = new EmbedBuilder()
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Você precisa fornecer o repositório no formato `usuário/repositório`',
          iconURL: 'http://bit.ly/4aIyY9j'
      });

  return message.reply({ embeds: [embedErroMinimo] });
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
        .setTitle(`📂 Repositório: ${data.full_name}`)
        .setURL(data.html_url)
        .setColor('Blue')
        .setDescription(data.description || 'Sem descrição disponível.')
        .addFields(
          { name: '👤 Autor', value: `[${data.owner.login}](${data.owner.html_url})`, inline: true },
          { name: '⭐ Estrelas', value: `${data.stargazers_count}`, inline: true },
          { name: '🍴 Forks', value: `${data.forks_count}`, inline: true },
          { name: '🐛 Issues Abertas', value: `${data.open_issues_count}`, inline: true },
          { name: '🔖 Linguagem', value: data.language || 'Não especificada', inline: true },
          { name: '📅 Criado em', value: new Date(data.created_at).toLocaleDateString('pt-BR'), inline: true },
          { name: '📅 Última Atualização', value: new Date(data.updated_at).toLocaleDateString('pt-BR'), inline: true }
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
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Repositório não encontrado. Verifique o nome e tente novamente.',
          iconURL: 'http://bit.ly/4aIyY9j'
      });

  return message.reply({ embeds: [embedErroMinimo] });
        }

        if (status === 403) {
          const embedErroMinimo = new EmbedBuilder()
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Limite de requisições da API do GitHub excedido. Tente novamente mais tarde.',
          iconURL: 'http://bit.ly/4aIyY9j'
      });

  return message.reply({ embeds: [embedErroMinimo] });
        }
      }
      const embedErroMinimo = new EmbedBuilder()
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Ocorreu um erro ao buscar informações do repositório.',
          iconURL: 'http://bit.ly/4aIyY9j'
      });

  return message.reply({ embeds: [embedErroMinimo] });
    }
  },
};