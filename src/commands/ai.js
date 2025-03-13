const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const MAX_CHARACTERS = 1500;
const conversationHistory = {};
const userThreads = {};
const TOPIC_TIMEOUT = 15 * 60 * 1000;

module.exports = {
  name: 'ai',
  description: 'Converse com a IA do ChatGPT em um tópico dedicado.',
  usage: '${currentPrefix}ai [pergunta]',
  permissions: 'Enviar Mensagens',

  async execute(message, args) {
    const userId = message.author.id;
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error('Erro: OPENAI_API_KEY não configurada.');
      return message.reply({
        embeds: [errorEmbed('Erro interno: chave da API não configurada.')],
        allowedMentions: { repliedUser: false },
      });
    }

    if (!args.length) {
      return message.reply({
        embeds: [errorEmbed('Você precisa fornecer uma pergunta!')],
        allowedMentions: { repliedUser: false },
      });
    }

    const question = args.join(' ');
    if (question.length > MAX_CHARACTERS) {
      return message.reply({
        embeds: [errorEmbed(`A pergunta é muito longa! Limite de ${MAX_CHARACTERS} caracteres.`)],
        allowedMentions: { repliedUser: false },
      });
    }

    if (userThreads[userId]) {
      try {
        const thread = await message.channel.threads.fetch(userThreads[userId]);

        if (thread && !thread.archived) {
          return message.channel.send(`${message.author}, você já tem um tópico aberto! Continue a conversa lá: ${thread}`);
        } else {
          delete userThreads[userId];
        }
      } catch (error) {
        console.error('Erro ao buscar o tópico:', error);
        delete userThreads[userId];
      }
    }

    try {
      if (!message.channel || !message.channel.threads) {
        return message.reply({
          embeds: [errorEmbed('Não foi possível criar um tópico. Verifique as permissões do bot.')],
          allowedMentions: { repliedUser: false },
        });
      }

      const thread = await message.channel.threads.create({
        name: `Punishment - ${message.author.displayName}`,
        autoArchiveDuration: 60,
        reason: 'Conversa iniciada com a IA',
      });

      if (!thread) {
        return message.reply({
          embeds: [errorEmbed('Não foi possível criar um tópico.')],
          allowedMentions: { repliedUser: false },
        });
      }

      userThreads[userId] = thread.id;
      conversationHistory[userId] = [];

      const thinkingMessage = await thread.send(`**${message.author.displayName} perguntou:**\n> ${question}\n\n**Aguarde...**`);

      conversationHistory[userId].push({ role: 'user', content: question });

      const response = await fetchAIResponse(conversationHistory[userId], apiKey);

      conversationHistory[userId].push({ role: 'assistant', content: response });

      await thinkingMessage.edit(`\n${response}`);

      setTimeout(async () => {
        try {
          const fetchedThread = await message.channel.threads.fetch(thread.id);
          if (fetchedThread) {
            await fetchedThread.delete();
          }
          delete userThreads[userId];
        } catch (error) {
          console.error('Erro ao excluir o tópico:', error);
        }
      }, TOPIC_TIMEOUT);

    } catch (error) {
      console.error('Erro ao criar o tópico:', error);
      return message.reply({
        embeds: [errorEmbed('Erro ao criar o tópico. Verifique as permissões do bot e tente novamente.')],
        allowedMentions: { repliedUser: false },
      });
    }
  },
};

module.exports.monitorThreadMessages = async (message) => {
  if (message.author.bot) return;
  if (!message.channel.isThread()) return;

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
      await message.channel.send({
        embeds: [errorEmbed('Erro ao processar a resposta. Tente novamente mais tarde.')],
      });
    }
  }
};

async function fetchAIResponse(conversation, apiKey) {
  try {
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

    if (!response.data || !response.data.choices || response.data.choices.length === 0) {
      throw new Error('Resposta inválida da API.');
    }

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Erro na API OpenAI:', error);
    return 'Houve um erro ao gerar a resposta. Tente novamente mais tarde.';
  }
}

function errorEmbed(text) {
  return new EmbedBuilder()
    .setColor('#FF4C4C')
    .setAuthor({ name: text, iconURL: 'https://imgur.com/ovJKL2f' });
}
