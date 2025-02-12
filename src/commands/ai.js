const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const MAX_CHARACTERS = 1500;
const conversationHistory = {};
const userThreads = {}; // Armazena os tópicos ativos de cada usuário
const TOPIC_TIMEOUT = 10 * 60 * 1000; // 10 minutos

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

    // Verifica se o usuário já tem um tópico ativo
    if (userThreads[userId]) {
      try {
        const thread = await message.channel.threads.fetch(userThreads[userId]);
        if (thread && !thread.archived) {
          return thread.send(`${message.author}, você já tem um tópico aberto! Continue a conversa lá.`);
        }
      } catch (error) {
        console.error('Erro ao buscar o tópico:', error);
      }
    }

    // Criar um novo tópico para o usuário
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

      const thinkingMessage = await thread.send(`**${message.author.displayName} perguntou:**\n> ${question}\n\n**Aguarde...**`);

      conversationHistory[userId].push({ role: 'user', content: question });

      const response = await fetchAIResponse(conversationHistory[userId], apiKey);
      conversationHistory[userId].push({ role: 'assistant', content: response });

      await thinkingMessage.edit(`\n${response}`);

      // Configura um timeout para fechar o tópico após 10 minutos de inatividade
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

// Evento para monitorar mensagens dentro do tópico e responder automaticamente
module.exports.monitorThreadMessages = async (message) => {
  if (message.author.bot) return;
  if (!message.channel.isThread()) return; // Garante que só roda dentro de tópicos

  const userId = message.author.id;
  const threadId = message.channel.id;

  if (userThreads[userId] && threadId === userThreads[userId]) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return;

    if (!conversationHistory[userId]) conversationHistory[userId] = [];

    conversationHistory[userId].push({ role: 'user', content: message.content });

    try {
      const response = await fetchAIResponse(conversationHistory[userId], apiKey);
      conversationHistory[userId].push({ role: 'assistant', content: response });

      await message.channel.send(`\n${response}`);

    } catch (error) {
      console.error('Erro ao consultar a IA:', error);
      await message.channel.send({ embeds: [errorEmbed('Erro ao processar a resposta. Tente novamente mais tarde.')] });
    }
  }
};

// Função para consultar a OpenAI
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

// Função para mensagens de erro padronizadas
function errorEmbed(text) {
  return new EmbedBuilder()
    .setColor('#FF4C4C')
    .setAuthor({ name: text, iconURL: 'http://bit.ly/4aIyY9j' });
        }
