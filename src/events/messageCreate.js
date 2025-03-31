const { Events } = require('discord.js');
const { handleAIResponse } = require('../handlers/aiHandler');
const { handleAntiLink } = require('../handlers/antiLinkHandler');
const { handleAntiSpam } = require('../handlers/antiSpamHandler');
const { handleCommands } = require('../handlers/commandHandler');
const { checkTerms } = require('../handlers/termsHandler');
const { getPrefix } = require('../utils/prefixes');
const logger = require('../utils/logger');

module.exports = {
  name: Events.MessageCreate,
  async execute(message, client) {
    try {
      if (message.author.bot || !message.guild) return;

      const termsAccepted = await checkTerms(message);
      if (!termsAccepted) return;

      if (await handleAIResponse(message)) return;

      if (await handleAntiLink(message)) return;

      if (await handleAntiSpam(message, client)) return;

      await handleCommands(message, client, { getPrefix });
    } catch (error) {
      logger.error(`ERRO: Erro no evento messageCreate: ${error.message}`, { stack: error.stack });
    }
  },
};