const { Events } = require('discord.js');
const { handleAIResponse } = require('../handlers/aiHandler');
const { handleAntiLink } = require('../handlers/antiLinkHandler');
const { handleAntiSpam } = require('../handlers/antiSpamHandler');
const { handleCommands } = require('../handlers/commandHandler');
const { getPrefix } = require('../util/prefixUtils');
const logger = require('../utils/logger');

const cooldown = new Set();

module.exports = {
  name: Events.MessageCreate,
  async execute(message, client) {
    try {
      if (message.author.bot || !message.guild) return;

      if (cooldown.has(message.author.id)) return;
      cooldown.add(message.author.id);
      setTimeout(() => cooldown.delete(message.author.id), 1000);

      if (await handleAIResponse(message)) return;
      if (await handleAntiLink(message)) return;
      if (await handleAntiSpam(message, client)) return;

      const prefix = await getPrefix(message.guild.id);
      if (!message.content.startsWith(prefix)) return;

      await handleCommands(message, client);

    } catch (error) {
      logger.error(`[messageCreate] ${error.message}`, {
        stack: error.stack,
        author: message.author?.tag,
        guild: message.guild?.name,
        content: message.content
      });

      const logChannel = client.channels.cache.get(process.env.LOG_CHANNEL);
      if (logChannel?.isTextBased?.()) {
        logChannel.send(
          '**Erro em `messageCreate`**\n' +
          `👤 Autor: \`${message.author?.tag}\`\n` +
          `📍 Servidor: \`${message.guild?.name}\`\n` +
          `💬 Mensagem: \`${message.content.slice(0, 100)}\`\n` +
          `\`\`\`js\n${error.stack.slice(0, 1800)}\`\`\``
        );
      }
    }
  },
};
