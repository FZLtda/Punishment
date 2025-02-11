const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'setprefix',
    description: 'Altera o prefixo do bot no servidor.',
    usage: '${currentPrefix}setprefix <prefixo>',
    permissions: 'Gerenciar Servidor',
    async execute(message, args, { setPrefix }) {
        if (!message.member.permissions.has('ManageGuild')) {
            return message.reply('<:no:1122370713932795997> Você não tem permissão para usar este comando.');
        }

        if (!args[0] || args[0].length > 5) {
            const embedErroMinimo = new EmbedBuilder()
                .setColor('#FF4C4C')
                .setAuthor({
                    name: 'Digite um novo prefixo respeitando o limite de 5 caracteres.',
                    iconURL: 'http://bit.ly/4aIyY9j',
                });

            return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
        }

        const newPrefix = args[0];
        try {
            setPrefix(message.guild.id, newPrefix);

            const embed = new EmbedBuilder()
                .setTitle('Prefixo Atualizado')
                .setDescription(`<:emoji_33:1219788320234803250> Prefixo alterado para: \`${newPrefix}\``)
                .setColor('#00FF00')
                .setFooter({ text: `${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) });

            return message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Erro ao alterar o prefixo:', error);
            const embedErroMinimo = new EmbedBuilder()
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Não foi possível alterar o prefixo devido a um erro.',
          iconURL: 'http://bit.ly/4aIyY9j'
      });

        return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
        }
    },
};
