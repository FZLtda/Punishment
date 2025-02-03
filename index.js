const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config();


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();
client.slashCommands = new Collection();


const prefixesPath = path.resolve(__dirname, './data/prefixes.json');
const acceptedUsersPath = path.resolve(__dirname, './data/acceptedUsers.json');

if (!fs.existsSync(prefixesPath)) {
  fs.mkdirSync(path.dirname(prefixesPath), { recursive: true });
  fs.writeFileSync(prefixesPath, JSON.stringify({}));
}

if (!fs.existsSync(acceptedUsersPath)) {
  fs.mkdirSync(path.dirname(acceptedUsersPath), { recursive: true });
  fs.writeFileSync(acceptedUsersPath, JSON.stringify([]));
}

const getPrefix = (guildId) => {
  const prefixes = JSON.parse(fs.readFileSync(prefixesPath, 'utf8'));
  return prefixes[guildId] || '.';
};

const setPrefix = (guildId, newPrefix) => {
  const prefixes = JSON.parse(fs.readFileSync(prefixesPath, 'utf8'));
  prefixes[guildId] = newPrefix;
  fs.writeFileSync(prefixesPath, JSON.stringify(prefixes, null, 4));
};


const commandsPath = path.join(__dirname, 'src/commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (!command.execute) {
    console.warn(`[INFO] Comando "${file}" não possui o método "execute" e foi ignorado.`);
    continue;
  }
  client.commands.set(command.name, command);
}


const slashCommandsPath = path.join(__dirname, 'src/slashCommands');
const slashCommandFiles = fs.readdirSync(slashCommandsPath).filter((file) => file.endsWith('.js'));
const slashCommands = [];

for (const file of slashCommandFiles) {
  const command = require(path.join(slashCommandsPath, file));
  if (command.data && command.data.name) {
    client.slashCommands.set(command.data.name, command);
    slashCommands.push(command.data.toJSON());
  } else {
    console.warn(`[INFO] Comando Slash "${file}" está mal formatado ou falta a propriedade 'data'.`);
  }
}


const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('[INFO] Registrando Slash Commands...');
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: slashCommands }
    );
    console.log('[SUCESSO] Slash Commands registrados com sucesso!');
  } catch (error) {
    console.error('Erro ao registrar Slash Commands:', error);
  }
})();


const eventsPath = path.join(__dirname, 'src/events');
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(path.join(eventsPath, file));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}


(async () => {
  try {
    await client.login(process.env.DISCORD_TOKEN);
    console.log('[INFO] Tentando inicializar o bot...');
  } catch (error) {
    console.error('[INFO] Erro ao inicializar o bot:', error);
  }
})();
