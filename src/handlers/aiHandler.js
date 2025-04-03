const { conversationHistory, fetchAIResponse } = require('../utils/aiUtils');
const { error } = require('../config/emoji.json')
const logger = require('../utils/logger');

const RATE_LIMIT = new Map();

async function handleAIResponse(message) {
  if (!message.channel.isThread() || !message.channel.name.startsWith('Punishment -')) return false;

  const userId = message.author.id;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return false;

  const lastUsed = RATE_LIMIT.get(userId) || 0;
  if (Date.now() - lastUsed < 5000) return false;
  RATE_LIMIT.set(userId, Date.now());

  if (!conversationHistory[userId]) {
    conversationHistory[userId] = [];
  }

  conversationHistory[userId].push({ role: 'user', content: message.content });

  try {
    const response = await fetchAIResponse(conversationHistory[userId], apiKey);
    conversationHistory[userId].push({ role: 'assistant', content: response });
    await message.channel.send(response);
    return true;
  } catch (error) {
    logger.error('ERRO: Erro ao consultar a IA:', error);
    await message.channel.send(`${error} Não foi possível processar a resposta da IA.`);
    return false;
  }
}

module.exports = { handleAIResponse };
