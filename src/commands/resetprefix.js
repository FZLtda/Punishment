const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'resetprefix',
    description: 'Redefine o prefixo do bot para o padrão no servidor.',
    usage: '${currentPrefix}resetprefix',
    permissions: 'Gerenciar Servidor',
    async execute(message, args, { setPrefix }) {
        
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            const embedErroMinimo = new EmbedBuilder()
                .setColor('#FF4C4C')
                .setAuthor({
                    name: 'Você não possui permissão para usar este comando.',
                    iconURL: 'http://bit.ly/4aIyY9j',
                });

            return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
        }

        try {
            
            setPrefix(message.guild.id, '.');

            const embed = new EmbedBuilder()
                .setTitle('Prefixo Redefinido')
                .setDescription('<:1000042885:1336044571125354496> Prefixo redefinido para o padrão: `.`')
                .setColor('#00FF00');

            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Erro ao redefinir o prefixo:', error);

            const embedErro = new EmbedBuilder()
                .setColor('#FF4C4C')
                .setAuthor({
                    name: 'Não foi possível redefinir o prefixo para o padrão devido a um erro.',
                    iconURL: 'http://bit.ly/4aIyY9j',
                });

            return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
        }
    },
};
