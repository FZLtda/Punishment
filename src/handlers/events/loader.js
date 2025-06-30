const fs = require('fs');
const path = require('path');
const Logger = require('@logger/index');

async function loadEvents(client) {
  const eventsPath = path.join(__dirname, '../../../events');
  const eventFiles = fs
    .readdirSync(eventsPath)
    .filter(file => file.endsWith('.js'));

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    try {
      const event = require(filePath);

      if (!event.name || typeof event.execute !== 'function') {
        Logger.warn(`Evento inválido em ${file}`);
        continue;
      }

      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
      } else {
        client.on(event.name, (...args) => event.execute(...args, client));
      }

      Logger.success(`Evento registrado: ${event.name}`);
    } catch (err) {
      Logger.error(`Erro ao carregar evento ${file}: ${err.message}`);
    }
  }
}

module.exports = {
  loadEvents
};
