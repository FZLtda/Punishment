const CommandExecutor = require('../utils/executeCommand');

module.exports = {
    name: 't',
    description: 'Executa comandos do terminal dentro do Discord.',
    usage: '${currentPrefix}t <comando>',
    deleteMessage: true,

    async execute(message, args) {
        const userIdPermitido = '1006909671908585586';
        if (message.author.id !== userIdPermitido) return;

        const comando = args.join(' ');
        if (!comando) return;

        try {
            const resultado = await CommandExecutor.run(comando);
            return message.channel.send(`\`\`\`js\n${resultado.slice(0, 2000)}\n\`\`\``);
        } catch (error) {
            return message.channel.send(`\`\`\`js\n${error.slice(0, 2000)}\n\`\`\``);
        }
    }
};
