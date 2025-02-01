const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = {
    name: 'doar',
    description: 'Faça uma doação para apoiar o servidor!',
    async execute(message, args) {
        if (!args[0] || isNaN(args[0])) {
            // Mensagem de erro com setAuthor
            const embedErro = new EmbedBuilder()
                .setColor('#FF4C4C') // Vermelho para erro
                .setAuthor({
                    name: 'Informe um valor válido! Exemplo: .doar 10',
                    iconURL: 'http://bit.ly/4aIyY9j' // Ícone vermelho
                });

            return message.reply({ embeds: [embedErro] });
        }

        const valor = parseFloat(args[0]) * 100; // Stripe usa centavos
        if (valor < 100) {
            // Mensagem de erro com setAuthor para valor mínimo
            const embedErroMinimo = new EmbedBuilder()
                .setColor('#FF4C4C') // Vermelho para erro
                .setAuthor({
                    name: 'O valor mínimo para doação é R$1,00.',
                    iconURL: 'http://bit.ly/4aIyY9j' // Ícone vermelho
                });

            return message.reply({ embeds: [embedErroMinimo] });
        }

        try {
            // Criar sessão de pagamento
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

            // Criar botão de doação
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('Fazer Doação')
                        .setStyle(ButtonStyle.Link)
                        .setURL(session.url)
                );

            // Criar embed
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle('💰 Doação Iniciada')
                .setDescription(`Obrigado pelo apoio, ${message.author}! 🙌\n\nClique no botão abaixo para doar **R$${(valor / 100).toFixed(2)}**.`)
                .setFooter({ text: 'Seu apoio ajuda a manter o servidor ativo!' });

            // Responder ao usuário
            await message.reply({ embeds: [embed], components: [row] });

        } catch (error) {
            console.error('Erro ao criar a sessão de pagamento:', error);

            // Criar embed de erro com setAuthor
            const embedErro = new EmbedBuilder()
                .setColor('#FF4C4C') // Vermelho para erro
                .setAuthor({
                    name: 'Algo deu errado. Tente novamente mais tarde.',
                    iconURL: 'http://bit.ly/4aIyY9j' // Ícone vermelho ao lado do texto
                });

            // Responder com o embed de erro
            await message.reply({ embeds: [embedErro] });
        }
    }
};