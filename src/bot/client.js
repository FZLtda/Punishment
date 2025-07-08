'use strict';

const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection
} = require('discord.js');

/**
 * Instância principal do bot com intents e coleções configuradas.
 */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildModeration
  ],
  partials: [
    Partials.User,
    Partials.Channel,
    Partials.GuildMember,
    Partials.Message,
    Partials.Reaction
  ]
});

// Coleções utilitárias
client.commands = new Collection();
client.slashCommands = new Collection();
client.buttons = new Collection();
client.contexts = new Collection();
client.cooldowns = new Collection();

module.exports = client;
