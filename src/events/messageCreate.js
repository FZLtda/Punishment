const { Events } = require('discord.js');
const { handleAIResponse } = require('../handlers/aiHandler');
const { handleAntiLink } = require('../handlers/antiLinkHandler');
const { handleAntiSpam } = require('../handlers/antiSpamHandler');
const { handleCommands } = require('../handlers/commandHandler');
const { checkTerms } = require('../handlers/termsHandler');
const { getPrefix } = require('../utils/prefixUtils');
const logger = require('../utils/logger');

const cooldown = new Set();

module.exports = {
  name: Events.MessageCreate,
  async execute(message, client) {
    try {
      if (!message.guild || message.author.bot) return;

      if (cooldown.has(message.author.id)) return;
      cooldown.add(message.author.id);
      setTimeout(() => cooldown.delete(message.author.id), 1000);

      if (await handleAIResponse(message)) return;
      if (await handleAntiLink(message)) return;
      if (await handleAntiSpam(message, client)) return;

      const prefix = await getPrefix(message.guild.id);
      if (!message.content.startsWith(prefix)) return;

      const accepted = await checkTerms(message);
      if (!accepted) return;

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
        logChannel.send({
          content:
            '**[Erro: messageCreate]**\n' +
            `<:Desbanido:1355718942076965016> Autor: \`${message.author?.tag}\`\n` +
            `<:Backup:1355721566582997054> Servidor: \`${message.guild?.name}\`\n` +
            `<:Desbloqueado:1355700557465125064> Mensagem: \`${message.content.slice(0, 100)}\`\n` +
            '```js\n' + error.stack.slice(0, 1900) + '\n```'
        });
      }
    }
  },
};
