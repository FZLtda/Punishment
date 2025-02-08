const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = {
    name: 'doar',
    description: 'Faça uma doação para apoiar o Punishment!',
    usage: '${currentPrefix}doar <valor>',
    permissions: 'Enviar Mensagens',
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
                .setTitle('Doação Iniciada')
                .setDescription(
                    `<:1000043196:1336360581934088193> **Obrigado pelo apoio, ${message.author}!**\n\n` +
                    `<:1000043192:1336359444006703144> Você está ajudando o **Projeto Punishment** a se manter ativo e a crescer.\n\n` +
                    `<:1000043188:1336358026306912359> **Valor da Doação:** R$${(valor / 100).toFixed(2)}\n\n` +
                    `<:1000043190:1336358527899406369> **Finalize sua doação clicando no botão abaixo:**\n` +
                    `Seu apoio faz toda a diferença!`
                )
                .setFooter({ text: 'Seu apoio ajuda a me manter ativo!' });

            const donationMessage = await message.reply({ embeds: [embed], components: [row] });

            
            setTimeout(() => {
                donationMessage.delete().catch(console.error);
            }, 120000); // 120000ms = 2 minutos

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
