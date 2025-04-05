const { Events } = require('discord.js');
const { handleAIResponse } = require('../handlers/aiHandler');
const { handleAntiLink } = require('../handlers/antiLinkHandler');
const { handleAntiSpam } = require('../handlers/antiSpamHandler');
const { handleCommands } = require('../handlers/commandHandler');
const { checkTerms } = require('../handlers/termsHandler');
const { getPrefix, setPrefix } = require('../utils/prefixUtils');
const logger = require('../utils/logger');

module.exports = {
  name: Events.MessageCreate,
  async execute(message, client) {
    try {
      if (message.author.bot || !message.guild) return;

      const prefix = getPrefix(message.guild.id);

      if (!message.content.startsWith(prefix)) return;

      const args = message.content.slice(prefix.length).trim().split(/ +/);
      const commandName = args.shift().toLowerCase();

      const command = client.commands.get(commandName);
      if (!command) return;

      const termsAccepted = await checkTerms(message);
      if (!termsAccepted) return;

      if (await handleAIResponse(message)) return;

      if (await handleAntiLink(message)) return;

      if (await handleAntiSpam(message, client)) return;

      await handleCommands(message, client, { getPrefix, setPrefix });
    } catch (error) {
      logger.error(`ERRO: Erro no evento messageCreate: ${error.message}`, { stack: error.stack });
    }
  },
};