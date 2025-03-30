const { Events } = require('discord.js');
const { handleAIResponse } = require('../utils/aiHandler.js');
const { handleAntiLink } = require('../handlers/antiLinkHandler.js');
const { handleAntiSpam } = require('../handlers/antiSpamHandler.js');
const { handleCommands } = require('../handlers/commandHandler.js');

module.exports = {
  name: Events.MessageCreate,
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;

    handleAIResponse(message);
    if (await handleAntiLink(message)) return;
    if (await handleAntiSpam(message, client)) return;
    
    handleCommands(message, client);
  },
};
