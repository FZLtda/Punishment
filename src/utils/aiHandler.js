const axios = require('axios');
require('dotenv').config();

const conversationHistory = {};

async function fetchAIResponse(history, apiKey) {
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: history,
            },
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Erro ao consultar a OpenAI:', error);
        return '❌ Erro ao processar a resposta. Tente novamente mais tarde.';
    }
}

module.exports = { conversationHistory, fetchAIResponse };
