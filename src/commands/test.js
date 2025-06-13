const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { yellow, red } = require('../config/colors.json');
const { icon_attention } = require('../config/emoji.json');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  name: 'test',
  description: 'Faça uma doação para apoiar o Punishment!',
  usage: '${currentPrefix}doar <valor>',
  userPermissions: ['SendMessages'],
  botPermissions: ['SendMessages'],
  deleteMessage: true,

  async execute(message, args) {
    const valor = parseFloat(args[0]?.replace(',', '.'));
    if (!valor || isNaN(valor)) {
      const embedErro = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({
          name: 'Informe um valor válido. Ex: .doar 10',
          iconURL: icon_attention,
        });
      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }

    const centavos = Math.round(valor * 100);
    const idempotencyKey = uuidv4();

    try {
      const response = await axios.post(
        'https://api.mercadopago.com/v1/payments',
        {
          transaction_amount: valor,
          payment_method_id: 'pix',
          description: 'Doação para Punishment',
          payer: {
            email: `${message.author.id}@punishment.bot`, // dummy email obrigatório
            first_name: message.author.username,
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.MERCADOPAGO_TOKEN}`,
            'Content-Type': 'application/json',
            'X-Idempotency-Key': idempotencyKey,
          },
        }
      );

      const qrCode = response.data.point_of_interaction.transaction_data.qr_code_base64;
      const linkPix = response.data.point_of_interaction.transaction_data.ticket_url;

      const embed = new EmbedBuilder()
        .setColor(red)
        .setTitle('Doação Iniciada')
        .setDescription(`Valor: R$${valor.toFixed(2)}`)
        .setImage(`data:image/png;base64,${qrCode}`)
        .setFooter({ text: 'Escaneie o QR ou use o botão abaixo.' });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel('Abrir no App')
          .setStyle(ButtonStyle.Link)
          .setURL(linkPix)
      );

      const msg = await message.channel.send({
        embeds: [embed],
        components: [row],
        allowedMentions: { repliedUser: false },
      });

      setTimeout(() => {
        msg.delete().catch(() => {});
      }, 120000);
    } catch (error) {
      console.error('Erro Mercado Pago:', error.response?.data || error.message);

      const erroEmbed = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({
          name: 'Erro ao gerar o Pix.',
          iconURL: icon_attention,
        });

      message.reply({ embeds: [erroEmbed], allowedMentions: { repliedUser: false } });
    }
  },
};
