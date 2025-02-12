const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const MAX_CHARACTERS = 1500;
const conversationHistory = {};
const userThreads = {};
const TOPIC_TIMEOUT = 10 * 60 * 1000;

module.exports = {
  name: 'ai',
  description: 'Converse com a IA do ChatGPT em um tópico dedicado.',
  usage: '${currentPrefix}ai [pergunta]',
  permissions: 'Enviar Mensagens',
  
  async execute(message, args) {
    const userId = message.author.id;
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return message.reply({ embeds: [errorEmbed('Erro interno: chave da API não configurada.')], allowedMentions: { repliedUser: false } });
    }

    if (!args.length) {
      return message.reply({ embeds: [errorEmbed('Você precisa fornecer uma pergunta!')], allowedMentions: { repliedUser: false } });
    }

    const question = args.join(' ');
    if (question.length > MAX_CHARACTERS) {
      return message.reply({ embeds: [errorEmbed(`A pergunta é muito longa! Limite de ${MAX_CHARACTERS} caracteres.`)], allowedMentions: { repliedUser: false } });
    }

    if (userThreads[userId]) {
      try {
        const thread = await message.channel.threads.fetch(userThreads[userId]);
        if (thread) {
          return thread.send(`${message.author}, você já tem um tópico aberto! Continue a conversa lá.`);
        }
      } catch (error) {
        console.error('Erro ao buscar o tópico:', error);
      }
    }

    try {
      if (!message.channel || !message.channel.threads) {
        return message.reply({ embeds: [errorEmbed('Não foi possível criar um tópico. Verifique as permissões do bot.')], allowedMentions: { repliedUser: false } });
      }

      const thread = await message.channel.threads.create({
        name: `Punishment - ${message.author.displayName}`,
        autoArchiveDuration: 60,
        reason: 'Conversa iniciada com a IA',
      });

      if (!thread) {
        return message.reply({ embeds: [errorEmbed('Não foi possível criar um tópico.')], allowedMentions: { repliedUser: false } });
      }

      userThreads[userId] = thread.id;
      conversationHistory[userId] = [];

      const thinkingMessage = await thread.send(`🤖 **${message.author.username} perguntou:**\n> ${question}\n\n⏳ **Aguarde...**`);

      conversationHistory[userId].push({ role: 'user', content: question });

      const response = await fetchAIResponse(conversationHistory[userId], apiKey);
      conversationHistory[userId].push({ role: 'assistant', content: response });

      await thinkingMessage.edit(`\n${response}`);

      setTimeout(async () => {
        if (thread && !thread.archived && !thread.locked) {
          await thread.setLocked(true);
          await thread.send('🔒 **Este tópico foi fechado devido à inatividade.**');
        }
      }, TOPIC_TIMEOUT);

    } catch (error) {
      console.error('Erro ao criar o tópico:', error);
      return message.reply({ embeds: [errorEmbed('Erro ao criar o tópico. Verifique as permissões do bot e tente novamente.')], allowedMentions: { repliedUser: false } });
    }
  },
};

module.exports.monitorThreadMessages = async (message) => {
  if (message.author.bot) return;

  const userId = message.author.id;
  if (userThreads[userId] && message.channel.id === userThreads[userId]) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return;

    if (!conversationHistory[userId]) conversationHistory[userId] = [];

    conversationHistory[userId].push({ role: 'user', content: message.content });

    try {
      const response = await fetchAIResponse(conversationHistory[userId], apiKey);
      conversationHistory[userId].push({ role: 'assistant', content: response });

      await message.channel.send(`🤖 **Resposta:**\n${response}`);

    } catch (error) {
      console.error('Erro ao consultar a IA:', error);
      await message.channel.send({ embeds: [errorEmbed('Erro ao processar a resposta. Tente novamente mais tarde.')] });
    }
  }
};

async function fetchAIResponse(conversation, apiKey) {
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-3.5-turbo',
      messages: conversation,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data.choices[0].message.content;
}

function errorEmbed(text) {
  return new EmbedBuilder()
    .setColor('#FF4C4C')
    .setAuthor({ name: text, iconURL: 'http://bit.ly/4aIyY9j' });
}
