const axios = require('axios');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { red, yellow } = require('../config/colors.json');
const { icon_attention } = require('../config/emoji.json');

module.exports = {
  name: 'test',
  description: 'Faça uma doação via PIX para o Punishment.',
  usage: '${currentPrefix}doar <valor>',
  userPermissions: ['SendMessages'],
  botPermissions: ['SendMessages'],
  deleteMessage: true,

  async execute(message, args) {
    const raw = args[0]?.replace(',', '.');
    const valor = parseFloat(raw);
    if (!valor || isNaN(valor)) {
      const embedErro = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({
          name: 'Valor inválido. Exemplo: .doar 10',
          iconURL: icon_attention,
        });
      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }

    try {
      const response = await axios.post(
        'https://api.mercadopago.com/v1/payments',
        {
          transaction_amount: valor,
          description: `Doação para Punishment`,
          payment_method_id: 'pix',
          payer: { email: `${message.author.id}@punishment.dev` },
          notification_url: 'https://seu-webhook-url.com/mercadopago',
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const { point_of_interaction } = response.data;
      const qrCodeBase64 = point_of_interaction.transaction_data.qr_code_base64;
      const pixCode = point_of_interaction.transaction_data.qr_code;

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel('Copia e Cola')
          .setStyle(ButtonStyle.Link)
          .setURL(`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(pixCode)}`)
      );

      const embed = new EmbedBuilder()
        .setColor(red)
        .setTitle('Doação via PIX')
        .setDescription(`Valor: **R$${valor.toFixed(2)}**`)
        .setImage(`data:image/png;base64,${qrCodeBase64}`)
        .setFooter({ text: 'Escaneie o QR Code ou clique no botão para copiar o código.' });

      const donationMessage = await message.channel.send({
        embeds: [embed],
        components: [row],
        allowedMentions: { repliedUser: false },
      });

      setTimeout(() => {
        donationMessage.delete().catch(() => {});
      }, 120000);
    } catch (error) {
      const embedErro = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({
          name: 'Erro ao gerar o PIX.',
          iconURL: icon_attention,
        });
      message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
      console.error('Erro Mercado Pago:', error.response?.data || error.message);
    }
  },
};
