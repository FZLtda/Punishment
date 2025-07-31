'use strict';

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { criarPagamento } = require('@services/mercadoPago');
const { colors } = require('@config');
const { sendWarning } = require('@utils/embedWarning');

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
      return sendWarning(message, 'Forneça um valor válido para doação. Exemplo: `.doar 10`');
    }

    try {
      const link = await criarPagamento(valor, message.author.id);

      const embed = new EmbedBuilder()
        .setTitle('Doação - Punishment')
        .setDescription('Muito obrigado por considerar doar!\nClique no botão abaixo para continuar com sua doação.')
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
          .setLabel('Fazer Doação')
          .setURL(link)
          .setStyle(ButtonStyle.Link)
      );

      await message.channel.send({ embeds: [embed], components: [row] });

    } catch (error) {
      console.error('[doar] Erro ao criar pagamento:', error);
      return sendWarning(message, 'Não foi possível gerar o link de pagamento. Tente novamente mais tarde.');
    }
  }
};
