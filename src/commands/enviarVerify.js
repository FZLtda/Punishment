const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getVerifyConfig } = require('../utils/verifyUtils');

module.exports = {
    name: 'enviar-verificação',
    description: 'Envia o sistema de verificação configurado.',
    usage: '.enviar-verificação',
    permissions: 'Administrator',
    async execute(message) {
        const config = getVerifyConfig(message.guild.id);
        if (!config) {
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#FF4C4C')
                    .setAuthor({
                        name: 'Nenhuma configuração de verificação encontrada.',
                        iconURL: 'http://bit.ly/4aIyY9j'
                    })]
            });
        }

        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setTitle('🔹 Verificação')
            .setDescription(config.message)
            .setFooter({
                text: 'Punishment',
                iconURL: message.client.user.displayAvatarURL(),
            });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('verify_button')
                    .setLabel(config.buttonText)
                    .setStyle(ButtonStyle.Success)
            );

        message.channel.send({ embeds: [embed], components: [row] });
    }
};