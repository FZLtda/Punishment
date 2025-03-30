const fs = require('fs');
const path = require('path');
const logger = require('./logger.js');

async function loadCommands(client) {
  const commandsPath = path.join(__dirname, '../commands');

  const loadFiles = (dir) => {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    return files.flatMap((file) =>
      file.isDirectory()
        ? loadFiles(path.join(dir, file.name))
        : file.name.endsWith('.js') || file.name.endsWith('.ts')
        ? [path.join(dir, file.name)]
        : []
    );
  };

  const commandFiles = loadFiles(commandsPath);

  for (const file of commandFiles) {
    try {
      const command = require(file);

      if (command.data && command.data.name) {
        client.slashCommands.set(command.data.name, command);
        logger.info(`Slash command carregado: ${command.data.name}`);
      } else if (command.name) {
        client.commands.set(command.name, command);
        logger.info(`Comando carregado: ${command.name}`);
      } else {
        logger.warn(`Comando ignorado (estrutura inválida): ${file}`);
      }
    } catch (error) {
      logger.error(`Erro ao carregar comando ${file}: ${error.message}`);
    }
  }
}

async function loadEvents(client) {
  const eventsPath = path.join(__dirname, '../events');

  const loadFiles = (dir) => {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    return files.flatMap((file) =>
      file.isDirectory()
        ? loadFiles(path.join(dir, file.name))
        : file.name.endsWith('.js') || file.name.endsWith('.ts')
        ? [path.join(dir, file.name)]
        : []
    );
  };

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