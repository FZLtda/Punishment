const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const { red, yellow } = require('../config/colors.json');
const { icon_attention } = require('../config/emoji.json');

const MP_TOKEN = process.env.MP_ACCESS_TOKEN;

module.exports = {
  name: 'test',
  description: 'Doação via Pix para o Punishment.',
  usage: '${currentPrefix}doar <valor>',
  userPermissions: ['SendMessages'],
  botPermissions: ['SendMessages'],
  deleteMessage: true,

  async execute(message, args) {
    if (!args[0] || isNaN(args[0])) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(yellow)
            .setAuthor({ name: 'Valor inválido.', iconURL: icon_attention })
        ],
        allowedMentions: { repliedUser: false }
      });
    }

    const valor = parseFloat(args[0]);

    try {
      const res = await axios.post(
        'https://api.mercadopago.com/v1/payments',
        {
          transaction_amount: valor,
          description: `Doação Punishment - ${message.author.tag}`,
          payment_method_id: 'pix',
          payer: {
            email: `${message.author.id}@funczero.xyz`
          },
          metadata: {
            discord_id: message.author.id
          }
        },
        {
          headers: {
            Authorization: `Bearer ${MP_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const { qr_code, ticket_url } = res.data.point_of_interaction.transaction_data;

      const embed = new EmbedBuilder()
        .setColor(red)
        .setTitle('Doação via Pix')
        .setDescription(`\`\`\`${qr_code}\`\`\``)
        .setFooter({ text: 'Finalize o pagamento com o código acima.' });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel('Comprovante')
          .setStyle(ButtonStyle.Link)
          .setURL(ticket_url)
      );

      const msg = await message.channel.send({
        embeds: [embed],
        components: [row],
        allowedMentions: { repliedUser: false }
      });

      setTimeout(() => {
        msg.delete().catch(() => {});
      }, 120000);

    } catch (err) {
      console.error(err);

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(yellow)
            .setAuthor({ name: 'Erro ao gerar o Pix.', iconURL: icon_attention })
        ],
        allowedMentions: { repliedUser: false }
      });
    }
  }
};
