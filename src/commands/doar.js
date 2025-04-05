const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = {
    name: 'doar',
    description: 'Faça uma doação para apoiar o Punishment!',
    usage: '${currentPrefix}doar <valor>',
    userPermissions: ['SendMessages'],
    botPermissions: ['SendMessages'],
    deleteMessage: true,
    
    async execute(message, args) {
        if (!args[0] || isNaN(args[0])) {
            const embedErro = new EmbedBuilder()
                .setColor('#FF4C4C')
                .setAuthor({
                    name: 'Informe um valor válido! Exemplo: .doar 10',
                    iconURL: 'https://bit.ly/43PItSI'
                });

            return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
        }

        const valor = parseFloat(args[0]) * 100;
        if (valor < 100) {
            const embedErroMinimo = new EmbedBuilder()
                .setColor('#FF4C4C')
                .setAuthor({
                    name: 'O valor mínimo para doação é R$1,00.',
                    iconURL: 'https://bit.ly/43PItSI'
                });

            return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
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
                success_url: 'https://funczero.xyz/doacoes',
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
                .setColor('#fe3838')
                .setTitle('Doação Iniciada')
                .setDescription(
                    `<:1000052556:1350579529604665384> ${message.author}, você está doando **R$${(valor / 100).toFixed(2)}** para o **Punishment**.`
                )
                .setFooter({ text: 'Finalize sua doação clicando no botão abaixo.' });

            const donationMessage = await message.channel.send({ embeds: [embed], components: [row], allowedMentions: { repliedUser: false } });

            
            setTimeout(() => {
                donationMessage.delete().catch(console.error);
            }, 120000);

        } catch (error) {
            console.error('Erro ao criar a sessão de pagamento:', error);

            const embedErro = new EmbedBuilder()
                .setColor('#FF4C4C')
                .setAuthor({
                    name: 'Algo deu errado. Tente novamente mais tarde.',
                    iconURL: 'https://bit.ly/43PItSI'
                });

            await message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
        }
    }
};
