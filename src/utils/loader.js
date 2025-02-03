const fs = require('fs');
const path = require('path');

const loadCommands = async (client) => {
  const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter((file) => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(`../commands/${file}`);
    client.commands.set(command.name, command);
  }
};

const loadEvents = async (client) => {
  const eventFiles = fs.readdirSync(path.join(__dirname, '../events')).filter((file) => file.endsWith('.js'));
  for (const file of eventFiles) {
    const event = require(`../events/${file}`);
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
  }
};

module.exports = { loadCommands, loadEvents };
