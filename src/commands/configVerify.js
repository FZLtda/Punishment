const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { setVerifyConfig } = require('../utils/verifyUtils');

module.exports = {
    name: 'config-verificação',
    description: 'Configura o sistema de verificação do servidor.',
    usage: '.config-verificação <@cargo> <mensagem> <texto_botao>',
    permissions: 'Administrator',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#FF4C4C')
                    .setAuthor({
                        name: 'Você precisa de permissão de Administrador para usar este comando.',
                        iconURL: 'http://bit.ly/4aIyY9j'
                    })]
            });
        }

        const role = message.mentions.roles.first();
        if (!role) {
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#FF4C4C')
                    .setAuthor({
                        name: 'Mencione um cargo válido.',
                        iconURL: 'http://bit.ly/4aIyY9j'
                    })]
            });
        }

        const textoBotao = args.slice(1).join(' ') || 'Verificar';
        const mensagemEmbed = args.slice(1).join(' ') || 'Clique no botão abaixo para se verificar!';

        setVerifyConfig(message.guild.id, {
            roleId: role.id,
            message: mensagemEmbed,
            buttonText: textoBotao
        });

        message.reply({
            embeds: [new EmbedBuilder()
                .setColor('#00FF00')
                .setAuthor({
                    name: 'Sistema de verificação configurado com sucesso!',
                    iconURL: 'http://bit.ly/4aIyY9j'
                })]
        });
    }
};