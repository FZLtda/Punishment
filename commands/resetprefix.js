const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'resetprefix',
    description: 'Redefine o prefixo do bot para o padrão neste servidor.',
    async execute(message, args, { setPrefix }) {
        if (!message.member.permissions.has('MANAGE_GUILD')) {
            return message.reply('<:no:1122370713932795997> Você não tem permissão para usar este comando.');
        }

        try {
            setPrefix(message.guild.id, '.');

            const embed = new EmbedBuilder()
                .setTitle('Prefixo Redefinido')
                .setDescription('✅ O prefixo foi redefinido para o padrão: `.`')
                .setColor('#00FF00');

            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Erro ao redefinir o prefixo:', error);
            message.reply('<:no:1122370713932795997> Não foi possível redefinir o prefixo.');
        }
    },
};