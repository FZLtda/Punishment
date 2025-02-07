const { EmbedBuilder } = require('discord.js');
const { deleteVerifyConfig } = require('../utils/verifyUtils');

module.exports = {
    name: 'reset-verificação',
    description: 'Reseta as configurações do sistema de verificação.',
    usage: '.reset-verificação',
    permissions: 'Administrator',
    async execute(message) {
        deleteVerifyConfig(message.guild.id);
        message.reply({
            embeds: [new EmbedBuilder()
                .setColor('#FF4C4C')
                .setAuthor({
                    name: 'Configuração de verificação resetada com sucesso.',
                    iconURL: 'http://bit.ly/4aIyY9j'
                })]
        });
    }
};