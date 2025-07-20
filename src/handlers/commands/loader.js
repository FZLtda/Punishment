'use strict';

const fs = require('fs');
const path = require('path');
const Logger = require('@logger');
const { ApplicationCommandType } = require('discord.js');

async function loadCommands(client) {
  const commandsPath = path.join(__dirname, '../../../src/commands');
  const categories = fs.readdirSync(commandsPath);

  client.commands = new Map();
  client.contextMenus = [];

  for (const category of categories) {
    const categoryPath = path.join(commandsPath, category);
    if (!fs.lstatSync(categoryPath).isDirectory()) continue;

    const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const filePath = path.join(categoryPath, file);

      try {
        const command = require(filePath);

        if (!command || (!command.name && !command.type)) {
          Logger.warn(`[Comando Ignorado] Faltando name ou type em: ${filePath}`);
          continue;
        }

        // Se for Context Menu
        if (command.type && (
          command.type === ApplicationCommandType.User ||
          command.type === ApplicationCommandType.Message
        )) {
          client.contextMenus.push(command);
          Logger.info(`[Context Menu] Carregado: ${command.name}`);
        }

        // Se for Comando Normal
        if (command.name && typeof command.execute === 'function') {
          client.commands.set(command.name, command);
          Logger.info(`[Comando] Carregado: ${command.name}`);
        }
      } catch (err) {
        Logger.error(`[Erro Loader] Falha ao carregar ${filePath}: ${err.message}`);
      }
    }
  }
}

module.exports = {
  loadCommands
};
