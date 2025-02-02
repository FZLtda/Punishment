const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = {
    name: 'doar',
    description: 'Faça uma doação para apoiar o servidor!',
    async execute(message, args) {
        if (!args[0] || isNaN(args[0])) {
            const embedErro = new EmbedBuilder()
                .setColor('#FF4C4C')
                .setAuthor({
                    name: 'Informe um valor válido! Exemplo: .doar 10',
                    iconURL: 'http://bit.ly/4aIyY9j'
                });

            return message.reply({ embeds: [embedErro] });
        }

        const valor = parseFloat(args[0]) * 100;
        if (valor < 100) {
            const embedErroMinimo = new EmbedBuilder()
                .setColor('#FF4C4C')
                .setAuthor({
                    name: 'O valor mínimo para doação é R$1,00.',
                    iconURL: 'http://bit.ly/4aIyY9j'
                });

            return message.reply({ embeds: [embedErroMinimo] });
        }

        try {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: 'brl',
                        product_data: { name: `Doação para Punishment` },
                        unit_amount: valor
                    },
                    quantity: 1
                }],
                mode: 'payment',
                success_url: 'https://funczero.xyz',
                cancel_url: 'https://funczero.xyz/cancelado',
                metadata: { userId: message.author.id }
            });

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('Finalizar Doação')
                        .setStyle(ButtonStyle.Link)
                        .setURL(session.url)
                );

            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle('💖 Doação Iniciada!')
                .setDescription(
                    `✨ **Obrigado pelo apoio, ${message.author}!**\n\n` +
                    `🎉 Você está ajudando o **Projeto Punishment** a se manter ativo e a crescer.\n\n` +
                    `💸 **Valor da Doação:** R$${(valor / 100).toFixed(2)}\n\n` +
                    `🔗 **Finalize sua doação clicando no botão abaixo:**\n` +
                    `Seu apoio faz toda a diferença! 🙌`
                )
                .setFooter({ text: 'Seu apoio ajuda a me manter ativo!' });

            await message.reply({ embeds: [embed], components: [row] });

        } catch (error) {
            console.error('Erro ao criar a sessão de pagamento:', error);

            const embedErro = new EmbedBuilder()
                .setColor('#FF4C4C')
                .setAuthor({
                    name: 'Algo deu errado. Tente novamente mais tarde.',
                    iconURL: 'http://bit.ly/4aIyY9j'
                });

            await message.reply({ embeds: [embedErro] });
        }
    }
};