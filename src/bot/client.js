'use strict';

const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection
} = require('discord.js');

/**
 * Instância principal do bot.
 * Sem presença estática — controlada externamente por setBotPresence.
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
 * Coleções utilitárias para modularidade e gerenciamento de estado.
 */
client.commands = new Collection();         // Comandos de prefixo
client.slashCommands = new Collection();    // Comandos de barra (/)
client.buttons = new Collection();          // Botões interativos
client.contexts = new Collection();         // Comandos contextuais
client.cooldowns = new Collection();        // Controle de cooldown

module.exports = client;
