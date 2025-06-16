const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');
const logger = require('../../utils/logger');
const { red, green } = require('../../config/colors.json');
const { square_icon } = require('../../config/emoji.json');

const SQUARE_TOKEN = process.env.SQUARE_TOKEN;
const APP_ID = process.env.SQUARE_APP_ID;
const OWNERS_ID = process.env.DEVS_ID?.split(',') || [];

module.exports = {
  name: 'squareinfo',
  description: 'Exibe informações técnicas detalhadas da aplicação na SquareCloud.',
  category: 'Administração',
  usage: '.squareinfo',
  userPermissions: ['Administrator'],
  deleteMessage: true,

  async execute(message) {
    if (!OWNERS_ID.includes(message.author.id)) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(red)
            .setTitle('Acesso negado')
            .setDescription('Este comando é restrito aos desenvolvedores autorizados.')
        ],
        allowedMentions: { repliedUser: false }
      });
    }

    try {
      const [infoRes, statsRes] = await Promise.all([
        fetch(`https://api.squarecloud.app/v2/apps/${APP_ID}`, {
          headers: { Authorization: SQUARE_TOKEN }
        }),
        fetch(`https://api.squarecloud.app/v2/apps/${APP_ID}/resources`, {
          headers: { Authorization: SQUARE_TOKEN }
        })
      ]);

      const infoData = await infoRes.json();
      const statsData = await statsRes.json();

      if (!infoRes.ok || !infoData.response) {
        logger.error(`[SQUARE] Erro na resposta da API (info): ${JSON.stringify(infoData)}`);
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(red)
              .setTitle('Erro ao obter informações da aplicação.')
              .setDescription(infoData.message || 'Erro desconhecido.')
          ],
          allowedMentions: { repliedUser: false }
        });
      }

      if (!statsRes.ok || !statsData.response) {
        logger.error(`[SQUARE] Erro na resposta da API (resources): ${JSON.stringify(statsData)}`);
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(red)
              .setTitle('Erro ao obter recursos da aplicação.')
              .setDescription(statsData.message || 'Erro desconhecido.')
          ],
          allowedMentions: { repliedUser: false }
        });
      }

      const { name, id, desc, language, ram, cluster } = infoData.response;
      const { cpu, ram: ramStats, network } = statsData.response;

      const embed = new EmbedBuilder()
        .setTitle('Informações da Aplicação SquareCloud')
        .setColor(green)
        .addFields(
          { name: 'Nome', value: name, inline: true },
          { name: 'ID', value: `\`${id}\``, inline: true },
          { name: 'Descrição', value: desc || 'N/A' },
          { name: 'Linguagem', value: language, inline: true },
          { name: 'Cluster', value: cluster, inline: true },
          { name: 'RAM Alocada', value: `${ram}MB`, inline: true },
          { name: 'RAM em Uso', value: `${ramStats.usage}MB / ${ramStats.limit}MB`, inline: true },
          { name: 'Uso de CPU', value: `${cpu.usage}%`, inline: true },
          { name: 'Rede Total', value: `${network.total}MB`, inline: true }
        )
        .setFooter({
          text: 'SquareCloud API v2',
          iconURL: square_icon
        })
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });

    } catch (error) {
      logger.error(`[SQUARE] Erro ao obter informações da aplicação: ${error.message}`);
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(red)
            .setTitle('Erro interno')
            .setDescription(`\`\`\`js\n${error.message}\n\`\`\``)
        ],
        allowedMentions: { repliedUser: false }
      });
    }
  }
};
