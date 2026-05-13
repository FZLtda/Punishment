"use strict";

const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
} = require("discord.js");

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

    this.commands = new Collection();
    this.slashCommands = new Collection();
    this.contexts = new Collection();
    this.buttons = new Collection();
    this.menus = new Collection();
    this.modals = new Collection();
    this.cooldowns = new Collection();

    this.utils = new Map();
    this.services = new Map();
    this.modules = new Map();
  }
}

module.exports = new PunishmentClient();
