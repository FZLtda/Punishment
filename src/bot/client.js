'use strict';

const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection
} = require('discord.js');

/**
 * Instância principal do bot com configurações otimizadas para produção
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
  ],
  presence: {
    status: 'dnd',
    activities: [{ name: '/help', type: 0 }]
  }
});

/**
 * Coleções auxiliares para modularidade e cache
 */
client.commands = new Collection();         // Comandos de prefixo
client.slashCommands = new Collection();    // Comandos de barra
client.buttons = new Collection();          // Botões interativos
client.contexts = new Collection();         // Menus contextuais
client.cooldowns = new Collection();        // Controle de cooldown por comando

module.exports = client;
