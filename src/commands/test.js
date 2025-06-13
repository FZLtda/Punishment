const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { yellow, red } = require('../config/colors.json');
const { icon_attention } = require('../config/emoji.json');
const axios = require('axios');
const crypto = require('crypto');

module.exports = {
  name: 'test',
  description: 'Faça uma doação via Pix para apoiar o Punishment!',
  usage: '${currentPrefix}doar <valor>',
  userPermissions: ['SendMessages'],
  botPermissions: ['SendMessages'],
  deleteMessage: true,

  async execute(message, args) {
    const valor = parseFloat(args[0]?.replace(',', '.'));

    if (!valor || valor <= 0) {
      const erro = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({ name: 'Informe um valor válido!', iconURL: icon_attention });

      return message.reply({ embeds: [erro], allowedMentions: { repliedUser: false } });
    }

    const idempotencyKey = crypto.randomUUID();
    const externalReference = `donation-${message.author.id}-${Date.now()}`;

    try {
      const response = await axios.post(
        'https://api.mercadopago.com/v1/payments',
        {
          transaction_amount: valor,
          payment_method_id: 'pix',
          description: 'Doação para Punishment',
          statement_descriptor: 'PUNISHMENT',
          notification_url: 'https://webhook.site/seu-endpoint-aqui',

          external_reference: externalReference,

          payer: {
            email: 'contato@funczero.xyz',
            first_name: message.author.username,
            last_name: 'DiscordUser',
            phone: {
              number: '11999999999' // ✅ Pontos extras
            },
            date_created: new Date().toISOString(), // ✅ Ponto extra
            registration_date: new Date().toISOString() // ✅ Ponto extra
          },

          additional_info: {
            items: [
              {
                id: 'donation',
                title: 'Doação Punishment',
                description: 'Apoio ao projeto de moderação',
                category_id: 'donation',
                quantity: 1,
                unit_price: valor
              }
            ]
          }
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.MP_TOKEN}`,
            'X-Idempotency-Key': idempotencyKey,
            'Content-Type': 'application/json'
          }
        }
      );

      const { point_of_interaction } = response.data;
      const pixUrl = point_of_interaction.transaction_data.ticket_url;

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel('Finalizar Doação via Pix')
          .setStyle(ButtonStyle.Link)
          .setURL(pixUrl)
      );

      const embed = new EmbedBuilder()
        .setColor(red)
        .setTitle('Doação Pix Iniciada')
        .setDescription(
          `${message.author}, você está doando **R$${valor.toFixed(2)}** para o **Punishment**.`
        )
        .setFooter({ text: 'Finalize sua doação clicando no botão abaixo.' });

      const msg = await message.channel.send({ embeds: [embed], components: [row], allowedMentions: { repliedUser: false } });

      setTimeout(() => msg.delete().catch(() => {}), 2 * 60 * 1000);
    } catch (error) {
      console.error('Erro Mercado Pago:', error.response?.data || error.message);

      const erro = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({
          name: 'Erro ao gerar o Pix. Tente novamente.',
          iconURL: icon_attention
        });

      await message.reply({ embeds: [erro], allowedMentions: { repliedUser: false } });
    }
  }
};
