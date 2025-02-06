const fs = require('fs');
const path = require('path');
const logger = require('./logger.js');

function loadCommands(client) {
  const commandsPath = path.join(__dirname, '../commands');
  if (!fs.existsSync(commandsPath)) {
    logger.warn(`[WARNING] Diretório 'commands' não encontrado em ${commandsPath}.`);
    return;
  }

  const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if (!command.name || !command.execute) {
      logger.warn(`[WARNING] Comando ignorado: ${file} (ausência de 'name' ou 'execute').`);
      continue;
    }
    client.commands.set(command.name, command);
    logger.info(`[INFO] Comando carregado: ${command.name}`);
  }
}

function loadEvents(client) {
  const eventsPath = path.join(__dirname, '../events');
  if (!fs.existsSync(eventsPath)) {
    logger.warn(`[WARNING] Diretório 'events' não encontrado em ${eventsPath}.`);
    return;
  }

  const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));
  for (const file of eventFiles) {
    const event = require(path.join(eventsPath, file));
    if (!event.name || !event.execute) {
      logger.warn(`[WARNING] Evento ignorado: ${file} (ausência de 'name' ou 'execute').`);
      continue;
    }

    if (event.once) {
      client.once(event.name, (...args) => {
        logger.info(`[EVENTO ONCE] Evento '${event.name}' disparado.`);
        event.execute(...args, client);
      });
    } else {
      client.on(event.name, (...args) => {
        logger.info(`[EVENTO] Evento '${event.name}' disparado.`);
        event.execute(...args, client);
      });
    }
    logger.info(`[INFO] Evento carregado: ${event.name}`);
  }
}

module.exports = { loadCommands, loadEvents };