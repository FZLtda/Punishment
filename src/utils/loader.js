const path = require('path');
const logger = require('./logger.js');
const loadFiles = require('../utils/fileLoader.js');

async function loadCommands(client) {
  const commandsPath = path.join(__dirname, '../commands');
  const commandFiles = loadFiles(commandsPath);

  for (const file of commandFiles) {
    try {
      const command = require(file);

      if (command.data && command.data.name) {
        client.slashCommands.set(command.data.name.toLowerCase(), command);
        logger.info(`(Slash) Comando carregado: ${command.data.name}`);
      } else if (command.name) {
        client.commands.set(command.name.toLowerCase(), command);
        logger.info(`Comando carregado: ${command.name}`);
      } else {
        logger.warn(`Ignorado (estrutura inválida): ${file}`);
      }
    } catch (error) {
      logger.error(`Erro ao carregar comando ${file}: ${error.message}`);
    }
  }
}

async function loadEvents(client) {
  const eventsPath = path.join(__dirname, '../events');
  const eventFiles = loadFiles(eventsPath);

  for (const file of eventFiles) {
    try {
      const event = require(file);

      if (event.name && typeof event.execute === 'function') {
        if (event.once) {
          client.once(event.name, (...args) => event.execute(...args, client));
        } else {
          client.on(event.name, (...args) => event.execute(...args, client));
        }
        logger.info(`Evento carregado: ${event.name}`);
      } else {
        logger.warn(`Evento ignorado (estrutura inválida): ${file}`);
      }
    } catch (error) {
      logger.error(`Erro ao carregar evento ${file}: ${error.message}`);
    }
  }
}

module.exports = { loadCommands, loadEvents };
