const { EmbedBuilder } = require('discord.js');
const { restartSquareApp } = require('../../utils/squareUtils');
const { icon_shutdown } = require('../../config/emoji.json');
const { red, green } = require('../../config/colors.json');

module.exports = {
  name: 'restart',
  description: 'Reinicia o bot na SquareCloud.',
  category: 'Administração',
  async execute(message) {
    const ownerIds = process.env.OWNERS_ID?.split(',') || [];
    if (!ownerIds.includes(message.author.id)) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(red)
            .setDescription(`${icon_shutdown} | Você não tem permissão para reiniciar o bot.`)
        ]
      });
    }

    const reply = await message.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(green)
          .setDescription(`${icon_shutdown} | Reiniciando a aplicação na SquareCloud...`)
      ]
    });

    const result = await restartSquareApp();
    if (!result || result.error) {
      return reply.edit({
        embeds: [
          new EmbedBuilder()
            .setColor(red)
            .setDescription(`${icon_shutdown} | Falha ao reiniciar o bot: ${result?.message || 'erro desconhecido'}`)
        ]
      });
    }

    return reply.edit({
      embeds: [
        new EmbedBuilder()
          .setColor(green)
          .setDescription(`${icon_shutdown} | Bot reiniciado com sucesso pela SquareCloud!`)
      ]
    });
  }
};
