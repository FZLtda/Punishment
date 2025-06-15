const { EmbedBuilder } = require('discord.js');
const CommandExecutor = require('../utils/executeCommand');
const { yellow, red } = require('../config/colors.json');
const { icon_attention } = require('../config/emoji.json');

module.exports = {
    name: 'terminal',
    description: 'Executa comandos do terminal dentro do Discord.',
    usage: '${currentPrefix}terminal <comando>',
    deleteMessage: true,

    async execute(message, args) {
        const userIdPermitido = '1006909671908585586';
        if (message.author.id !== userIdPermitido) {
            const embedErro = new EmbedBuilder()
                .setColor(yellow)
                .setAuthor({ name: 'Você não tem permissão para executar este comando.', iconURL: icon_attention });

            return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
        }

        const comando = args.join(' ');
        if (!comando) {
            const embedErro = new EmbedBuilder()
                .setColor(yellow)
                .setAuthor({ name: 'Forneça um comando válido para executar.', iconURL: icon_attention });

            return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
        }

        try {
            const resultado = await CommandExecutor.run(comando);

            const embed = new EmbedBuilder()
                .setTitle('🖥️ Execução de Terminal')
                .setDescription(`**Comando:** \`${comando}\`\n**Resultado:**\n\`\`\`${resultado.slice(0, 1000)}\`\`\``)
                .setColor(red);

            return message.reply({ embeds: [embed] });
        } catch (error) {
            const embedErro = new EmbedBuilder()
                .setColor(red)
                .setAuthor({ name: 'Erro ao executar comando!', iconURL: icon_attention })
                .setDescription(`\`\`\`${error.slice(0, 1000)}\`\`\``);

            return message.reply({ embeds: [embedErro] });
        }
    }
};
