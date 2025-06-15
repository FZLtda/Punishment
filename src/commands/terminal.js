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
            return message.reply({
                embeds: [new EmbedBuilder().setColor(yellow).setAuthor({ name: 'Você não tem permissão para executar este comando.', iconURL: icon_attention })],
                allowedMentions: { repliedUser: false }
            });
        }

        const comando = args.join(' ');
        if (!comando) {
            return message.reply({
                embeds: [new EmbedBuilder().setColor(yellow).setAuthor({ name: 'Forneça um comando válido para executar.', iconURL: icon_attention })],
                allowedMentions: { repliedUser: false }
            });
        }

        try {
            const resultado = await CommandExecutor.run(comando);
            const respostaFormatada = `\`\`\`bash\n${resultado.slice(0, 2000)}\n\`\`\``; // Formata como terminal

            const embed = new EmbedBuilder()
                .setTitle('🖥️ Execução de Terminal')
                .setDescription(`**Comando:** \`${comando}\`\n\n${respostaFormatada}`)
                .setColor(red);

            return message.reply({ embeds: [embed] });
        } catch (error) {
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor(red)
                    .setAuthor({ name: 'Erro ao executar comando!', iconURL: icon_attention })
                    .setDescription(`\`\`\`bash\n${error.slice(0, 2000)}\n\`\`\``)]
            });
        }
    }
};
