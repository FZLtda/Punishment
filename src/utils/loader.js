const path = require('path');
const logger = require('./logger.js');
const loadFiles = require('./fileLoader.js');
const chalk = require('chalk');

async function loadCommands(client) {
  const commandsPath = path.join(__dirname, '../commands');
  const commandFiles = loadFiles(commandsPath);

  for (const file of commandFiles) {
    try {
      const start = Date.now();
      const command = require(file);

      if (!command || typeof command !== 'object') {
        logger.warn(`Ignorado (comando malformado): ${file}`);
        continue;
      }

      if (command.data?.name) {
        const name = command.data.name.toLowerCase();
        client.slashCommands.set(name, command);
        logger.info(chalk.blueBright(`[SLASH] ${name} carregado (${Date.now() - start}ms)`));
      } else if (command.name) {
        const name = command.name.toLowerCase();
        client.commands.set(name, command);
        logger.info(chalk.cyan(`[PREFIX] ${name} carregado (${Date.now() - start}ms)`));
      } else {
        logger.warn(`Ignorado (estrutura inválida): ${file}`);
      }

      client.commandMetadata ||= [];
      client.commandMetadata.push({
        name: command.data?.name || command.name || 'Desconhecido',
        file,
        type: command.data ? 'slash' : 'prefix',
        loadedAt: new Date(),
      });

    } catch (error) {
      logger.error(`Erro ao carregar comando ${file}: ${error.message}`, { stack: error.stack });
    }
  }
}

async function loadEvents(client) {
  const eventsPath = path.join(__dirname, '../events');
  const eventFiles = loadFiles(eventsPath);

  for (const file of eventFiles) {
    try {
      const start = Date.now();
      const event = require(file);

      if (event.name && typeof event.execute === 'function') {
        const handler = (...args) => event.execute(...args, client);
        if (event.once) {
          client.once(event.name, handler);
        } else {
          client.on(event.name, handler);
        }
        logger.info(chalk.magenta(`[EVENT] ${event.name} carregado (${Date.now() - start}ms)`));
      } else {
        logger.warn(`Evento ignorado (estrutura inválida): ${file}`);
      }

    } catch (error) {
      logger.error(`Erro ao carregar evento ${file}: ${error.message}`, { stack: error.stack });
    }
  }
}

module.exports = { loadCommands, loadEvents };