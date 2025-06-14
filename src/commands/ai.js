const { EmbedBuilder } = require('discord.js');
const { yellow } = require('../config/colors.json');
const { icon_attention } = require('../config/emoji.json');
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
  userPermissions: ['SendMessages'],
  botPermissions: ['SendMessages'],
  deleteMessage: true,
  
  async execute(message, args) {
    const userId = message.author.id;
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error('ERRO: OPENAI_API_KEY não configurada.');
      const embedErroMinimo = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({
          name: 'Não foi possível obter resposta da API.',
          iconURL: icon_attention
        });

      return message.channel.send({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
    }

    if (!args.length) {
      const embedErroMinimo = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({
          name: 'Forneça uma pergunta para obter uma resposta.',
          iconURL: icon_attention
        });

      return message.channel.send({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
    }

    const question = args.join(' ');
    if (question.length > MAX_CHARACTERS) {
      const embedErroMinimo = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({
          name: 'A pergunta ultrapassa o limite permitido.',
          iconURL: icon_attention
        });

      return message.channel.send({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
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
        const embedErroMinimo = new EmbedBuilder()
          .setColor(yellow)
          .setAuthor({
            name: 'Não foi possível completar a criação do tópico.',
            iconURL: icon_attention
          });

        return message.channel.send({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
      }

      const thread = await message.channel.threads.create({
        name: `Punishment - ${message.author.displayName}`,
        autoArchiveDuration: 60,
        reason: 'Conversa iniciada com a IA',
      });

      if (!thread) {
        const embedErroMinimo = new EmbedBuilder()
          .setColor(yellow)
          .setAuthor({
            name: 'Não foi possível completar a criação do tópico.',
            iconURL: icon_attention
          });

        return message.channel.send({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
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
      const embedErroMinimo = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({
          name: 'Não foi possível completar a criação do tópico.',
          iconURL: icon_attention
        });

      return message.channel.send({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
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
    return 'Erro ao gerar a resposta. Tente novamente mais tarde.';
  }
}

function errorEmbed(text) {
  return new EmbedBuilder()
    .setColor(yellow)
    .setAuthor({ 
      name: text, 
      iconURL: icon_attention });
}
