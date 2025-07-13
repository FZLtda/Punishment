'use strict';

const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection
} = require('discord.js');

/**
 * Classe estendida do Client para comportar um bot modular e escalável.
 */
class PunishmentClient extends Client {
  constructor(options = {}) {
    super({
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
      ...options
    });

    // Inicialização das coleções
    this.commands = new Collection();
    this.slashCommands = new Collection();
    this.contexts = new Collection();
    this.buttons = new Collection();
    this.menus = new Collection();
    this.cooldowns = new Collection();

    // Carga dinâmica
    this.utils = new Map();
    this.services = new Map();
    this.modules = new Map();
  }
}

module.exports = new PunishmentClient();
