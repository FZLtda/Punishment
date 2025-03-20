const db = require('../data/database');
const { getPrefix, setPrefix } = require('../utils/prefixes');
const { conversationHistory, fetchAIResponse } = require('../utils/aiHandler');
const customCommandHandler = require('../utils/customCommandHandler');

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot || !message.guild) return;

        // Verifica se a mensagem foi enviada em um tópico que começa com 'Punishment -'
        if (message.channel.isThread() && message.channel.name.startsWith('Punishment -')) {
            const userId = message.author.id;
            const apiKey = process.env.OPENAI_API_KEY;

            if (!apiKey) return;

            if (!conversationHistory[userId]) {
                conversationHistory[userId] = [];
            }

            conversationHistory[userId].push({
                role: 'user',
                content: message.content,
            });

            try {
                const response = await fetchAIResponse(userId, apiKey);
                message.channel.send(response);
            } catch (error) {
                console.error('Erro ao obter resposta da IA:', error);
            }
        }

        // Verifica se a mensagem é um comando personalizado
        if (message.content.startsWith(await getPrefix(message.guild.id))) {
            const args = message.content.slice((await getPrefix(message.guild.id)).length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();

            try {
                await customCommandHandler(message, commandName, args, client);
            } catch (error) {
                console.error('Erro ao executar comando personalizado:', error);
            }
        }
    }
};
