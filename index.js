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


client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;

  const prefix = getPrefix(message.guild.id);
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (!command) return;

  const acceptedUsers = JSON.parse(fs.readFileSync(acceptedUsersPath, 'utf8'));

  if (!acceptedUsers.includes(message.author.id)) {
    const embed = {
      color: 0xfe3838,
      title: 'Termos de Uso',
      description:
        'Para continuar usando o **Punishment**, você precisa aceitar nossos **Termos de Uso**.\n\nClique no botão **"Ler Termos"** para visualizar os termos, ou clique em **"Aceitar Termos"** se você já leu e concorda com eles.',
      footer: { text: 'Obrigado por utilizar o Punishment!' },
    };

    const row = {
      type: 1,
      components: [
        {
          type: 2,
          label: 'Ler Termos',
          style: 5,
          url: 'https://docs.google.com/document/d/12-nG-vY0bhgIzsaO2moSHjh7QeCrQLSGd7W2XYDMXsk/edit?usp=drivesdk',
        },
        {
          type: 2,
          customId: 'accept_terms',
          label: 'Aceitar Termos',
          style: 3,
        },
      ],
    };

    await message.reply({ embeds: [embed], components: [row] });
    return;
  }

  try {
    await command.execute(message, args, { setPrefix, getPrefix });
  } catch (error) {
    console.error(`[INFO] Erro ao executar o comando "${commandName}":`, error);
    message.reply('Não foi possível executar o comando.');
  }
});


(async () => {
  try {
    await client.login(process.env.DISCORD_TOKEN);
    console.log('[INFO] Tentando inicializar o bot...');
  } catch (error) {
    console.error('[INFO] Erro ao inicializar o bot:', error);
  }
})();
