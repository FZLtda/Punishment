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

if (!fs.existsSync(prefixesPath)) {
  fs.mkdirSync(path.dirname(prefixesPath), { recursive: true });
  fs.writeFileSync(prefixesPath, JSON.stringify({}));
}

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (!command.execute) {
    console.warn(`Comando "${file}" não possui o método "execute" e será ignorado.`);
    continue;
  }
  client.commands.set(command.name, command);
}

const slashCommandsPath = path.join(__dirname, 'slashCommands');
const slashCommandFiles = fs.readdirSync(slashCommandsPath).filter(file => file.endsWith('.js'));

const slashCommands = [];
for (const file of slashCommandFiles) {
  const command = require(path.join(slashCommandsPath, file));
  if (command.data && command.data.name) {
    client.slashCommands.set(command.data.name, command);
    slashCommands.push(command.data.toJSON());
  } else {
    console.warn(`Comando Slash "${file}" está mal formatado ou falta a propriedade 'data'.`);
  }
}

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);
(async () => {
  try {
    console.log('Registrando Slash Commands...');
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: slashCommands }
    );
    console.log('Slash Commands registrados com sucesso!');
  } catch (error) {
    console.error('Erro ao registrar Slash Commands:', error);
  }
})();

client.once('ready', () => {
  console.log(`Bot online como ${client.user.tag}`);

  client.user.setPresence({
    status: 'dnd',
    activities: [
      {
        name: 'Moderar servidores',
        type: 'WATCHING',
      },
    ],
  });
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;

  const prefixes = JSON.parse(fs.readFileSync(prefixesPath, 'utf8'));

  const prefix = prefixes[message.guild.id] || '.';

  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (!command) return;

  try {
    await command.execute(message, args);
  } catch (error) {
    console.error(`Erro ao executar o comando "${commandName}":`, error);
    message.reply('Houve um erro ao executar este comando.');
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.slashCommands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Erro ao executar o comando "${interaction.commandName}":`, error);
    await interaction.reply({
      content: 'Houve um erro ao executar este comando.',
      ephemeral: true,
    });
  }
});

(async () => {
  try {
    await client.login(process.env.DISCORD_TOKEN);
  } catch (error) {
    console.error('Erro ao inicializar o bot:', error);
  }
})();