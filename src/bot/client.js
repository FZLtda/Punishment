'use strict';

const { 
  Client, 
  GatewayIntentBits, 
  Partials, 
  Collection 
} = require('discord.js');

/**
 * @type {Client}
 * Cliente principal do Discord com intents e partials definidos
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

/**
 * Estruturas auxiliares para comandos e interações
 * Facilitam o carregamento modular e a execução dinâmica
 */
client.commands = new Collection();
client.slashCommands = new Collection();
client.buttons = new Collection();
client.contexts = new Collection();
client.cooldowns = new Collection();

module.exports = client;
