const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Collection } = require('discord.js');
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

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('Registrando Slash Commands...');
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: [] });
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

  const acceptedUsers = JSON.parse(fs.readFileSync(acceptedUsersPath, 'utf8'));

  if (!acceptedUsers.includes(message.author.id)) {
    const embed = new EmbedBuilder()
      .setColor(0xfe3838)
      .setTitle('Termos de Uso')
      .setDescription(
        'Para continuar usando o **Punishment**, você precisa aceitar nossos **Termos de Uso**.\n\nClique no botão **"Ler Termos"** para visualizar os termos, ou clique em **"Aceitar Termos"** se você já leu e concorda com eles.'
      )
      .setFooter({ text: 'Obrigado por utilizar o Punishment!' });

    const row = new ActionRowBuilder()
  .addComponents(
    new ButtonBuilder()
      .setLabel('Ler Termos')
      .setStyle(ButtonStyle.Link)
      .setURL('https://docs.google.com/document/d/12-nG-vY0bhgIzsaO2moSHjh7QeCrQLSGd7W2XYDMXsk/edit?usp=drivesdk'),
    new ButtonBuilder()
      .setCustomId('accept_terms')
      .setLabel('Aceitar Termos')
      .setStyle(ButtonStyle.Success)
      .setEmoji({ id: '1219815388921991259', name: 'emoji_34' })
      );

    await message.reply({ embeds: [embed], components: [row] });
    return;
  }

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (!command) return;

  try {
    await command.execute(message, args, { setPrefix, getPrefix });
  } catch (error) {
    console.error(`Erro ao executar o comando "${commandName}":`, error);
    message.reply('<:no:1122370713932795997> Não foi possível executar o comando.');
  }
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isButton() && interaction.customId === 'accept_terms') {
    const acceptedUsers = JSON.parse(fs.readFileSync(acceptedUsersPath, 'utf8'));

    if (acceptedUsers.includes(interaction.user.id)) {
      return interaction.reply({
        content: 'Você já aceitou os termos anteriormente.',
        ephemeral: true,
      });
    }

    acceptedUsers.push(interaction.user.id);
    fs.writeFileSync(acceptedUsersPath, JSON.stringify(acceptedUsers, null, 4));

    return interaction.reply({
      content: '<:emoji_33:1219788320234803250> Obrigado por aceitar nossos termos! Agora você pode usar o Punishment.',
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