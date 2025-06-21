const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');
const logger = require('@utils/logger');
const { colors, emojis } = require('@config');

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
            .setColor(colors.red)
            .setTitle('Acesso negado')
            .setDescription('Este comando é restrito aos desenvolvedores autorizados.')
        ],
        allowedMentions: { repliedUser: false }
      });
    }

    try {
      const res = await fetch(`https://api.squarecloud.app/v2/apps/${APP_ID}`, {
        headers: { Authorization: SQUARE_TOKEN }
      });

      const data = await res.json();

      if (!res.ok || !data.response) {
        logger.error('[SQUARE] Não foi possível obter os dados da aplicação.');
        return;
      }

      const { name, id, desc, language, ram, cluster, status } = data.response;

      const embed = new EmbedBuilder()
        .setTitle('Informações da Aplicação')
        .setColor(colors.green)
        .addFields(
          { name: 'Nome', value: name, inline: true },
          { name: 'ID', value: `\`${id}\``, inline: true },
          { name: 'Descrição', value: desc || 'N/A' },
          { name: 'Linguagem', value: language, inline: true },
          { name: 'RAM Alocada', value: `${ram}MB`, inline: true },
          { name: 'Cluster', value: cluster, inline: true },
          { name: 'Status', value: status || 'Desconhecido', inline: true }
        )
        .setFooter({
          text: 'SquareCloud API v2',
          iconURL: emojis.square_icon
        })
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });

    } catch (error) {
      logger.error('[SQUARE] Não foi possível obter informações da aplicação');
      return;
    }
  }
};
