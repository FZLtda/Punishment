const { EmbedBuilder } = require('discord.js');
const { restartSquareApp } = require('../../utils/squareUtils');
const { icon_shutdown } = require('../../config/emoji.json');
const { red, green } = require('../../config/colors.json');
const logger = require('../../utils/logger');

module.exports = {
  name: 'restart',
  description: 'Reinicia o bot na SquareCloud.',
  category: 'Administração',
  async execute(message) {
    const ownerIds = process.env.OWNERS_ID?.split(',') || [];
    const userTag = `${message.author.tag} (${message.author.id})`;

    if (!ownerIds.includes(message.author.id)) {
      logger.warn(`[RESTART] Acesso negado para ${userTag}`);
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(red)
            .setDescription('Você não tem permissão para reiniciar o bot.')
        ]
      });
    }

    logger.info(`[RESTART] Reinício solicitado por ${userTag}`);

    const reply = await message.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(green)
          .setDescription('Reiniciando a aplicação na SquareCloud...')
      ]
    });

    const result = await restartSquareApp();

    if (!result || result.error) {
      logger.error(`[RESTART] Falha ao reiniciar via SquareCloud: ${result?.message || 'erro desconhecido'}`);
      return reply.edit({
        embeds: [
          new EmbedBuilder()
            .setColor(red)
            .setDescription(`Falha ao reiniciar o bot: ${result?.message || 'erro desconhecido'}`)
        ]
      });
    }

    logger.info(`[Punishment] foi reiniciado via SquareCloud por ${userTag}`);
    return reply.edit({
      embeds: [
        new EmbedBuilder()
          .setColor(green)
          .setDescription(' Punishment foi reiniciado com sucesso pela SquareCloud!')
      ]
    });
  }
};
