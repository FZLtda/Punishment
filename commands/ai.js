const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const MAX_CHARACTERS = 1500;
const conversationHistory = {};
const TOPIC_TIMEOUT = 10 * 60 * 1000;

module.exports = {
  name: 'ai',
  description: 'Converse com a IA do ChatGPT em um tópico dedicado.',
  async execute(message, args) {
    const userId = message.author.id;
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error('ERRO: A chave da API OpenAI não está configurada no .env!');
      const embedErroMinimo = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({
          name: 'Erro interno: chave da API não configurada.',
          iconURL: 'http://bit.ly/4aIyY9j',
        });

      return message.reply({ embeds: [embedErroMinimo] });
    }

    if (!args.length) {
      const embedErroMinimo = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({
          name: 'Você precisa fornecer uma pergunta!',
          iconURL: 'http://bit.ly/4aIyY9j',
        });

      return message.reply({ embeds: [embedErroMinimo] });
    }

    const question = args.join(' ');

    if (question.length > MAX_CHARACTERS) {
      const embedErroMinimo = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({
          name: `A pergunta é muito longa! Limite de ${MAX_CHARACTERS} caracteres.`,
          iconURL: 'http://bit.ly/4aIyY9j',
        });

      return message.reply({ embeds: [embedErroMinimo] });
    }

    try {
      const thread = await message.channel.threads.create({
        name: `Punishment - ${message.author.displayName}`,
        autoArchiveDuration: 60,
        reason: 'Conversa iniciada com a IA',
      });

      if (!thread) {
        const embedErroMinimo = new EmbedBuilder()
          .setColor('#FF4C4C')
          .setAuthor({
            name: 'Não foi possível criar um tópico. Verifique as permissões do bot.',
            iconURL: 'http://bit.ly/4aIyY9j',
          });

        return message.reply({ embeds: [embedErroMinimo] });
      }

      const thinkingMessage = await thread.send(
        `🤖 **${message.author.username} perguntou:**\n> ${question}\n\n⏳ **Aguarde...**`
      );

      if (!conversationHistory[userId]) {
        conversationHistory[userId] = [];
      }

      conversationHistory[userId].push({ role: 'user', content: question });

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: conversationHistory[userId],
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          }
        }
      );

      const answer = response.data.choices[0].message.content;
      conversationHistory[userId].push({ role: 'assistant', content: answer });

      if (conversationHistory[userId].length > 10) {
        conversationHistory[userId].shift();
      }

      await thinkingMessage.edit(`\n${answer}`);

      setTimeout(async () => {
        if (thread && !thread.archived && !thread.locked) {
          await thread.setLocked(true);
          await thread.send('🔒 **Este tópico foi fechado devido à inatividade.**');
        }
      }, TOPIC_TIMEOUT);

    } catch (error) {
      console.error('Erro ao consultar a OpenAI:', error);
      const embedErroMinimo = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({
          name: 'Não foi possível processar sua solicitação. Tente novamente mais tarde.',
          iconURL: 'http://bit.ly/4aIyY9j',
        });

      return message.reply({ embeds: [embedErroMinimo] });
    }
  },
};