const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');
const { colors, emojis } = require('@config');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = {
  name: 'doar',
  description: 'Faça uma doação para apoiar o Punishment!',
  usage: '${currentPrefix}doar <valor>',
  botPermissions: ['SendMessages'],
  deleteMessage: true,

  async execute(message, args) {
    const input = args[0];
    const valor = parseFloat(input) * 100;

    if (!input || isNaN(input)) {
      return responderErro(message, 'Informe um valor válido! Exemplo: .doar 10');
    }

    if (valor < 100) {
      return responderErro(message, 'O valor mínimo para doação é R$1,00.');
    }

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'brl',
            product_data: { name: 'Doação para Punishment' },
            unit_amount: valor
          },
          quantity: 1
        }],
        mode: 'payment',
        success_url: 'https://funczero.xyz/doacoes',
        cancel_url: 'https://funczero.xyz/cancelado',
        metadata: { userId: message.author.id }
      });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel('Finalizar Doação')
          .setStyle(ButtonStyle.Link)
          .setURL(session.url)
      );

      const embedSucesso = new EmbedBuilder()
        .setColor(colors.red)
        .setTitle('Doação Iniciada')
        .setDescription(`${message.author}, você está doando **R$${(valor / 100).toFixed(2)}** para o **Punishment**.`)
        .setFooter({ text: 'Finalize sua doação clicando no botão abaixo.' });

      const mensagem = await message.channel.send({
        embeds: [embedSucesso],
        components: [row],
        allowedMentions: { repliedUser: false }
      });

      setTimeout(() => mensagem.delete().catch(() => null), 120_000);

    } catch (error) {
      console.error('[Stripe] Falha ao criar sessão de pagamento:', error);
      return responderErro(message, 'Algo deu errado. Tente novamente mais tarde.');
    }
  }
};

// 🔧 Função utilitária para erros padronizados
function responderErro(message, texto) {
  const embed = new EmbedBuilder()
    .setColor(colors.yellow)
    .setAuthor({ name: texto, iconURL: emojis.attention });

  return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
}
