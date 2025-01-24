const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

module.exports = {
  name: 'github',
  description: 'Busca informações detalhadas sobre um repositório do GitHub.',
  usage: '!github <usuário/repositório>',
  async execute(message, args) {
    const repo = args[0];
    if (!repo) {
      return message.reply(
        '<:no:1122370713932795997> Uso inválido! Você precisa fornecer o repositório no formato `usuário/repositório`.'
      );
    }

    const githubToken = process.env.GITHUB_TOKEN;
    const apiUrl = `https://api.github.com/repos/${repo}`;

    try {
      console.log(`[DEBUG] Buscando repositório: ${repo}`);
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${githubToken}`,
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

      if (error.response?.status === 404) {
        return message.reply('<:no:1122370713932795997> Repositório não encontrado. Verifique o nome e tente novamente.');
      }

      return message.reply('<:no:1122370713932795997> Ocorreu um erro ao buscar informações do repositório.');
    }
  },
};