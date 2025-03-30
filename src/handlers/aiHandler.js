const { conversationHistory, fetchAIResponse } = require('../utils/aiHandler');

async function handleAIResponse(message) {
  if (!message.channel.isThread() || !message.channel.name.startsWith('Punishment -')) return;

  const userId = message.author.id;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return;

  if (!conversationHistory[userId]) {
    conversationHistory[userId] = [];
  }
  
  conversationHistory[userId].push({ role: 'user', content: message.content });

  try {
    const response = await fetchAIResponse(conversationHistory[userId], apiKey);
    conversationHistory[userId].push({ role: 'assistant', content: response });
    await message.channel.send(`\n${response}`);
  } catch (error) {
    console.error('Erro ao consultar a IA:', error);
    await message.channel.send('<:1000042883:1336044555354771638> Erro ao processar a resposta.');
  }
}

module.exports = { handleAIResponse };
