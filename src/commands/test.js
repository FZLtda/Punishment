const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { yellow, red } = require('../config/colors.json');
const { icon_attention } = require('../config/emoji.json');
const axios = require('axios');

module.exports = {
  name: 'test',
  description: 'Faça uma doação para apoiar o Punishment!',
  usage: '${currentPrefix}doar <valor>',
  userPermissions: ['SendMessages'],
  botPermissions: ['SendMessages'],
  deleteMessage: true,

  async execute(message, args) {
    const raw = (args[0] || '').replace(',', '.');
    const valor = parseFloat(raw);

    if (isNaN(valor)) {
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
          description: 'Doação para Punishment',
          payment_method_id: 'pix',
          payer: {
            email: `${message.author.id}@punishment.dev`
          },
          notification_url: 'https://funczero.xyz/doacoes/webhook', // seu webhook
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
            'X-Idempotency-Key': `${message.author.id}-${Date.now()}`
          }
        }
      );

      const { id, point_of_interaction } = response.data;
      const qrImage = point_of_interaction.transaction_data.qr_code_base64;
      const qrCode = point_of_interaction.transaction_data.qr_code;

      const embed = new EmbedBuilder()
        .setColor(red)
        .setTitle('Doação via Pix')
        .setDescription(`\`\`\`${qrCode}\`\`\``)
        .setImage(`data:image/png;base64,${qrImage}`)
        .setFooter({ text: `ID da doação: ${id}` });

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setLabel('Copiar código Pix')
            .setStyle(ButtonStyle.Link)
            .setURL(`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrCode)}`)
        );

      await message.channel.send({
        embeds: [embed],
        components: [row],
        allowedMentions: { repliedUser: false }
      });

    } catch (err) {
      console.error('Erro Mercado Pago:', err.response?.data || err);

      const embedErro = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({
          name: 'Erro ao gerar o Pix.',
          iconURL: icon_attention,
        });

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }
  }
};
