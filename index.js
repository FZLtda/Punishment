const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config();

console.log('[DEBUG] Iniciando configuração do bot...');

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

console.log('[DEBUG] Coleções de comandos e slashCommands inicializadas.');

const dataPath = path.resolve(__dirname, './src/data');
const prefixesPath = path.join(dataPath, 'prefixes.json');
const acceptedUsersPath = path.join(dataPath, 'acceptedUsers.json');

const initializeFile = (filePath, defaultData) => {

  if (!fs.existsSync(filePath)) {
  
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`[INFO] Pasta criada: ${dirPath}`);
    }
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 4));
    console.log(`[INFO] Arquivo criado: ${filePath}`);
  }
};

initializeFile(prefixesPath, {});
initializeFile(acceptedUsersPath, []);

const getPrefix = (guildId) => {
  const prefixes = JSON.parse(fs.readFileSync(prefixesPath, 'utf8'));
  return prefixes[guildId] || '.';
};

const setPrefix = (guildId, newPrefix) => {
  const prefixes = JSON.parse(fs.readFileSync(prefixesPath, 'utf8'));
  prefixes[guildId] = newPrefix;
  fs.writeFileSync(prefixesPath, JSON.stringify(prefixes, null, 4));
  console.log(`[INFO] Prefixo atualizado para o servidor ${guildId}: ${newPrefix}`);
};

const commandsPath = path.join(__dirname, 'src/commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

console.log('[DEBUG] Carregando comandos...');
for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (!command.execute) {
    console.warn(`[WARN] Comando "${file}" ignorado (sem método "execute").`);
    continue;
  }
  client.commands.set(command.name, command);
  console.log(`[INFO] Comando carregado: ${command.name}`);
}

const slashCommandsPath = path.join(__dirname, 'src/slashCommands');
const slashCommandFiles = fs.readdirSync(slashCommandsPath).filter((file) => file.endsWith('.js'));
const slashCommands = [];

console.log('[DEBUG] Carregando Slash Commands...');
for (const file of slashCommandFiles) {
  const command = require(path.join(slashCommandsPath, file));
  if (command.data && command.data.name) {
    client.slashCommands.set(command.data.name, command);
    slashCommands.push(command.data.toJSON());
    console.log(`[INFO] Slash Command carregado: ${command.data.name}`);
  } else {
    console.warn(`[WARN] Slash Command "${file}" ignorado (mal formatado ou sem propriedade "data").`);
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
    console.error('[ERROR] Erro ao registrar Slash Commands:', error);
  }
})();

const eventsPath = path.join(__dirname, 'src/events');
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));

console.log('[DEBUG] Carregando eventos...');
for (const file of eventFiles) {
  const event = require(path.join(eventsPath, file));
  if (event.once) {
    client.once(event.name, (...args) => {
      console.log(`[EVENTO ONCE] Evento "${event.name}" disparado.`);
      event.execute(...args, client);
    });
  } else {
    client.on(event.name, (...args) => {
      console.log(`[EVENTO] Evento "${event.name}" disparado.`);
      event.execute(...args, client);
    });
  }
}

(async () => {
  try {
    console.log('[INFO] Tentando inicializar o bot...');
    await client.login(process.env.DISCORD_TOKEN);
    console.log('[SUCESSO] Bot inicializado com sucesso!');
  } catch (error) {
    console.error('[ERROR] Erro ao inicializar o bot:', error);
  }
})();
