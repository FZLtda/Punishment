'use strict';

const { conversationHistory, fetchAIResponse } = require('@utils/aiUtils');
const { emojis } = require('@config');
const logger = require('@utils/logger');

const RATE_LIMIT = new Map();
const COOLDOWN_MS = 5000;
const THREAD_PREFIX = 'Punishment -';

async function handleAIResponse(message) {
  if (
    !message.guild ||
    !message.channel ||
    !message.author ||
    !message.channel.isThread() ||
    !message.channel.name.startsWith(THREAD_PREFIX)
  ) {
    return false;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    logger.warn('OPENAI_API_KEY não configurada.');
    return false;
  }

  const userId = message.author.id;
  const now = Date.now();

  const lastUsed = RATE_LIMIT.get(userId) || 0;
  if (now - lastUsed < COOLDOWN_MS) return false;
  RATE_LIMIT.set(userId, now);

  if (!conversationHistory[userId]) {
    conversationHistory[userId] = [];
  }

  conversationHistory[userId].push({ role: 'user', content: message.content });

  try {
    const response = await fetchAIResponse(conversationHistory[userId], apiKey);

    if (!response) {
      logger.warn(`Resposta vazia da IA para ${message.author.tag}`);
      await message.channel.send(
        `${emojis.attent} A IA não conseguiu gerar uma resposta agora. Tente novamente em instantes.`
      );
      return false;
    }

    conversationHistory[userId].push({ role: 'assistant', content: response });

    await message.channel.send(response);
    logger.info(`Resposta da IA enviada para ${message.author.tag} em ${message.channel.name}`);
    return true;
  } catch (error) {
    logger.error(`Erro ao consultar IA para ${message.author.tag}: ${error.message}`, {
      stack: error.stack,
    });

    await message.channel.send(`${emojis.attent} Houve um erro ao tentar consultar a IA.`);
    return false;
  }
}

module.exports = { handleAIResponse };
