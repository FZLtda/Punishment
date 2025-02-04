const fs = require('fs');
const path = require('path');

/**
 * Carrega os comandos da pasta "commands" e os registra no client.
 * @param {Client} client - O cliente do bot do Discord.
 */
const loadCommands = async (client) => {
  const commandFiles = fs
    .readdirSync(path.join(__dirname, '../src/commands')) // Caminho ajustado para refletir a estrutura do projeto
    .filter((file) => file.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(`../src/commands/${file}`);
    if (!command.name || !command.execute) {
      console.warn(`[WARN] O arquivo "${file}" não possui as propriedades "name" ou "execute". Ignorado.`);
      continue;
    }
    client.commands.set(command.name, command);
    console.log(`[INFO] Comando "${command.name}" carregado com sucesso.`);
  }
};

/**
 * Carrega os eventos da pasta "events" e os registra no client.
 * @param {Client} client - O cliente do bot do Discord.
 */
const loadEvents = async (client) => {
  const eventFiles = fs
    .readdirSync(path.join(__dirname, '../src/events')) // Caminho ajustado para refletir a estrutura do projeto
    .filter((file) => file.endsWith('.js'));

  for (const file of eventFiles) {
    const event = require(`../src/events/${file}`); // Caminho ajustado
    if (!event.name || !event.execute) {
      console.warn(`[WARN] O arquivo "${file}" não possui as propriedades "name" ou "execute". Ignorado.`);
      continue;
    }
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
    console.log(`[INFO] Evento "${event.name}" carregado com sucesso.`);
  }
};

module.exports = { loadCommands, loadEvents };
