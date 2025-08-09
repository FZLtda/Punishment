'use strict';

const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection
} = require('discord.js');

/**
 * Classe personalizada que estende o Client do Discord.js,
 * projetada para oferecer uma estrutura modular, escalável e de fácil manutenção
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
    this.modals = new Collection();
    this.cooldowns = new Collection();

    // Carga dinâmica
    this.utils = new Map();
    this.services = new Map();
    this.modules = new Map();
  }
}

module.exports = new PunishmentClient();
