const { Events } = require('discord.js');
const { handleAIResponse } = require('../handlers/aiHandler');
const { handleAntiLink } = require('../handlers/antiLinkHandler');
const { handleAntiSpam } = require('../handlers/antiSpamHandler');
const { handleCommands } = require('../handlers/commandHandler');
const logger = require('../utils/logger');

const cooldown = new Set();

module.exports = {
  name: Events.MessageCreate,
  async execute(message, client) {
    try {
      // Ignora mensagens de bots ou mensagens fora de servidores
      if (message.author.bot || !message.guild) return;

      // Aplica cooldown para evitar spam
      if (cooldown.has(message.author.id)) return;
      cooldown.add(message.author.id);
      setTimeout(() => cooldown.delete(message.author.id), 1000);

      // Verifica se a mensagem é um comando
      const prefix = process.env.PREFIX || '!';
      if (!message.content.startsWith(prefix)) return;

      // Processa sistemas adicionais (AI, Anti-Link, Anti-Spam)
      if (await handleAIResponse(message)) return;
      if (await handleAntiLink(message)) return;
      if (await handleAntiSpam(message, client)) return;

      // Encaminha a mensagem para o manipulador de comandos
      await handleCommands(message, client);
    } catch (error) {
      logger.error(`ERRO: Erro no evento messageCreate: ${error.message}`, { stack: error.stack });

      const logChannel = client.channels.cache.get(process.env.LOG_CHANNEL);
      if (logChannel) {
        logChannel.send(`Erro detectado: \`messageCreate\`:\n\`\`\`${error.stack.slice(0, 1800)}\`\`\``);
      }
    }
  },
};