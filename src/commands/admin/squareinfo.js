const { EmbedBuilder } = require('discord.js');
const { red, green } = require('../../config/colors.json');
const { icon_shutdown } = require('../../config/emoji.json');
const fetch = require('node-fetch');

const SQUARE_TOKEN = process.env.SQUARE_TOKEN;
const APP_ID = process.env.SQUARE_APP_ID;

module.exports = {
  name: 'squareinfo',
  description: 'Exibe informações técnicas da aplicação na SquareCloud.',
  category: 'Administração',
  async execute(message) {
    const ownerIds = process.env.OWNERS_ID?.split(',') || [];
    if (!ownerIds.includes(message.author.id)) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(red)
            .setDescription(`${icon_shutdown} | Você não tem permissão para usar este comando.`)
        ]
      });
    }

    try {
      const response = await fetch(`https://api.squarecloud.app/v2/apps/${APP_ID}`, {
        headers: {
          Authorization: SQUARE_TOKEN
        }
      });

      const data = await response.json();

      if (!response.ok || !data.response) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(red)
              .setTitle('Falha ao obter informações do bot')
              .setDescription(`Erro: ${data.message || 'Resposta inesperada da API SquareCloud.'}`)
          ]
        });
      }

      const info = data.response;

      const embed = new EmbedBuilder()
        .setTitle(`📘 Informações do Bot: ${info.name}`)
        .setColor(green)
        .addFields(
          { name: '🆔 App ID', value: `\`${info.id}\`` },
          { name: '📄 Descrição', value: info.desc || 'Nenhuma descrição disponível.' },
          { name: '🖥️ Linguagem', value: `\`${info.language}\``, inline: true },
          { name: '💾 RAM Alocada', value: `\`${info.ram}MB\``, inline: true },
          { name: '☁️ Cluster', value: `\`${info.cluster}\``, inline: true }
        )
        .setFooter({ text: 'Dados da SquareCloud (v2 API)', iconURL: message.client.user.displayAvatarURL() });

      return message.reply({ embeds: [embed] });

    } catch (err) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(red)
            .setTitle('Erro inesperado')
            .setDescription(`\`\`\`js\n${err.message}\n\`\`\``)
        ]
      });
    }
  }
};
