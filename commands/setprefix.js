const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'setprefix',
    description: 'Altera o prefixo do bot no servidor.',
    async execute(message, args, { setPrefix }) {
        if (!message.member.permissions.has('ManageGuild')) {
            return message.reply('<:no:1122370713932795997> Você não tem permissão para usar este comando.');
        }

        if (!args[0] || args[0].length > 5) {
            return message.reply('<:no:1122370713932795997> Por favor, forneça um prefixo válido (máximo de 5 caracteres).');
        }

        const newPrefix = args[0];
        try {
            setPrefix(message.guild.id, newPrefix);

            const embed = new EmbedBuilder()
                .setTitle('Prefixo Atualizado')
                .setDescription(`✅ O prefixo foi alterado para: \`${newPrefix}\``)
                .setColor('#00FF00')
                .setFooter({ text: `Alterado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) });

            return message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Erro ao alterar o prefixo:', error);
            return message.reply('<:no:1122370713932795997> Não foi possível alterar o prefixo.');
        }
    },
};