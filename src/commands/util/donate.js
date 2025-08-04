'use strict';

const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { criarPagamento } = require('@services/mercadoPago');
const { colors } = require('@config');
const { sendWarning } = require('@embeds/embedWarning');

module.exports = {
  name: 'doar',
  description: 'Faça uma doação para apoiar o desenvolvimento do bot.',
  usage: '${currentPrefix}doar <valor>',
  category: 'Utilidade',
  userPermissions: [],
  botPermissions: [],
  deleteMessage: true,

  async execute(message, args) {
    const valor = parseFloat(args[0]);

    if (isNaN(valor) || valor <= 0) {
      return sendWarning(message, 'Forneça um valor válido para doação.');
    }

    try {
      const link = await criarPagamento(valor, message.author.id);

      const embed = new EmbedBuilder()
        .setTitle('Punishment - Doação')
        .setDescription('Clique no botão abaixo para finalizar sua doação.')
        .addFields(
          { name: 'Valor', value: `R$ ${valor.toFixed(2)}`, inline: true },
          { name: 'Usuário', value: `<@${message.author.id}>`, inline: true }
        )
        .setColor(colors.red)
        .setFooter({
          text: message.author.username,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel('Finalizar Doação')
          .setURL(link)
          .setStyle(ButtonStyle.Link),
        new ButtonBuilder()
          .setLabel('Ver Agradecimentos')
          .setURL(process.env.THANKS_CHANNEL_URL)
          .setStyle(ButtonStyle.Link)
      );

      const sentMessage = await message.channel.send({
        embeds: [embed],
        components: [row],
      });

      setTimeout(() => {
        sentMessage.delete().catch(() => {});
      }, 30000);

    } catch (error) {
      console.error('[doar] Erro ao criar pagamento:', error);
      return sendWarning(message,'Não foi possível gerar o link de pagamento.'
      );
    }
  },
};
