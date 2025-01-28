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

// Certifique-se de que os arquivos necessários existem
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

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (!command.execute) {
    console.warn(`Comando "${file}" não possui o método "execute" e foi ignorado.`);
    continue;
  }
  client.commands.set(command.name, command);
}

const slashCommandsPath = path.join(__dirname, 'slashCommands');
const slashCommandFiles = fs.readdirSync(slashCommandsPath).filter((file) => file.endsWith('.js'));

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
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: slashCommands });
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
        name: '.help',
        type: 0,
      },
    ],
  });
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;

  const prefix = getPrefix(message.guild.id);
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (!command) return;

  // Verifique se o usuário aceitou os termos de uso
  const acceptedUsers = JSON.parse(fs.readFileSync(acceptedUsersPath, 'utf8'));
  if (!acceptedUsers.includes(message.author.id)) {
    const filter = (m) => m.author.id === message.author.id;
    message.reply(
      'Você precisa aceitar os termos de uso para continuar usando o bot. Por favor, leia e digite "aceito" para continuar:\n\n' +
        '**Termos de Uso:**\n' +
        '1. Você é responsável por seus atos.\n' +
        '2. Não use o bot para atividades ilegais.\n' +
        '3. Respeite os outros usuários.\n\n' +
        'Digite "aceito" para continuar.'
    );

    try {
      const collected = await message.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] });
      const response = collected.first().content.toLowerCase();

      if (response === 'aceito') {
        acceptedUsers.push(message.author.id);
        fs.writeFileSync(acceptedUsersPath, JSON.stringify(acceptedUsers, null, 4));
        return message.reply('Obrigado por aceitar os termos! Agora você pode usar os comandos.');
      } else {
        return message.reply('Você não aceitou os termos. Não poderá usar o bot.');
      }
    } catch (error) {
      return message.reply('Você não respondeu a tempo. Tente usar o comando novamente e aceitar os termos.');
    }
  }

  // Execute o comando se os termos foram aceitos
  try {
    await command.execute(message, args, { setPrefix, getPrefix });
  } catch (error) {
    console.error(`Erro ao executar o comando "${commandName}":`, error);
    message.reply('<:no:1122370713932795997> Não foi possível executar o comando.');
  }
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isCommand()) {
    const command = client.slashCommands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`Erro ao executar o comando "${interaction.commandName}":`, error);
      await interaction.reply({
        content: '<:no:1122370713932795997> Não foi possível executar o comando.',
        ephemeral: true,
      });
    }
  }

  if (interaction.isButton()) {
    const verifyCommand = require('./commands/verify');
    if (verifyCommand && typeof verifyCommand.handleInteraction === 'function') {
      try {
        await verifyCommand.handleInteraction(interaction);
      } catch (error) {
        console.error('Erro ao lidar com a interação do botão:', error);
        await interaction.reply({
          content: 'Ocorreu um erro ao processar esta interação.',
          ephemeral: true,
        });
      }
    }
  }
});

(async () => {
  try {
    await client.login(process.env.DISCORD_TOKEN);
  } catch (error) {
    console.error('Erro ao inicializar o bot:', error);
  }
})();