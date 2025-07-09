const fs = require('fs');
const path = require('path');
const Logger = require('@logger/index');

async function loadEvents(client) {
  const eventsPath = path.join(__dirname, '../../../src/events');
  const eventFiles = fs
    .readdirSync(eventsPath)
    .filter(file => file.endsWith('.js'));

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    try {
      const event = require(filePath);

      if (!event.name || typeof event.execute !== 'function') {
        Logger.warn(`[loadEvents] Evento inválido em: ${file}`);
        continue;
      }

      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
      } else {
        client.on(event.name, (...args) => event.execute(...args, client));
      }

      Logger.info(`[loadEvents] Evento registrado: ${event.name}`);
    } catch (err) {
      Logger.error(`[loadEvents] Não foi possível carregar: ${file}: ${err.message}`);
    }
  }
}

module.exports = {
  loadEvents
};
