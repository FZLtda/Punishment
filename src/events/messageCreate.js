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
      if (message.author.bot || !message.guild) return;

      if (cooldown.has(message.author.id)) return;
      cooldown.add(message.author.id);
      setTimeout(() => cooldown.delete(message.author.id), 1000);

      const termsAccepted = await checkTerms(message);
      if (!termsAccepted) return;

      if (await handleAIResponse(message)) return;
      if (await handleAntiLink(messag)) return;
      if (await handleAntiSpam(message, client)) return;

      await handleCommands(message, client);
      
    } catch (error) {
      logger.error(`ERRO: Erro no evento messageCreate: ${error.message}`, { stack: error.stack });

      const logChannel = client.channels.cache.get(process.env.LOG_CHANNEL);
      if (logChannel) {
        logChannel.send(`Erro em \`messageCreate\`:\n\`\`\`${error.stack.slice(0, 1800)}\`\`\``);
      }
    }
  },
};
