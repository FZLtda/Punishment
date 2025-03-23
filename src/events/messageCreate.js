const fs = require('fs');
const db = require('../data/database');
const { Events, PermissionsBitField } = require('discord.js');
const { getPrefix, setPrefix } = require('../utils/prefixes');
const { conversationHistory, fetchAIResponse } = require('../utils/aiHandler');

const ANTI_LINK_PATH = './data/antilink.json';
const ANTI_SPAM_PATH = './data/antispam.json';
const messageCounts = new Map();

module.exports = {
  name: Events.MessageCreate,
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;

    handleAIResponse(message);
    if (await handleAntiLink(message)) return;
    if (await handleAntiSpam(message, client)) return;
    
    handleCommands(message, client);
  },
};

async function handleAIResponse(message) {
  if (!message.channel.isThread() || !message.channel.name.startsWith('Punishment -')) return;

  const userId = message.author.id;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return;

  if (!conversationHistory[userId]) {
    conversationHistory[userId] = [];
  }
  
  conversationHistory[userId].push({ role: 'user', content: message.content });

  try {
    const response = await fetchAIResponse(conversationHistory[userId], apiKey);
    conversationHistory[userId].push({ role: 'assistant', content: response });
    await message.channel.send(`\n${response}`);
  } catch (error) {
    console.error('Erro ao consultar a IA:', error);
    await message.channel.send('<:1000042883:1336044555354771638> Erro ao processar a resposta.');
  }
}

async function handleAntiLink(message) {
  const settings = loadSettings(ANTI_LINK_PATH);
  if (!settings[message.guild.id]?.enabled) return false;

  const linkRegex = /(https?:\/\/|www\.)\S+/gi;
  if (linkRegex.test(message.content) && !message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
    try {
      await message.delete();
      const reply = await message.channel.send(`<:1000042883:1336044555354771638> ${message.author}, links não são permitidos neste servidor.`);
      setTimeout(() => reply.delete().catch(() => {}), 5000);
    } catch (error) {
      console.error('Erro ao excluir mensagem com link:', error);
    }
    return true;
  }
  return false;
}

async function handleAntiSpam(message, client) {
  const settings = loadSettings(ANTI_SPAM_PATH);
  if (!settings[message.guild.id]?.enabled) return false;

  const key = `${message.guild.id}-${message.author.id}`;
  if (!messageCounts.has(key)) {
    messageCounts.set(key, { count: 0, timestamp: Date.now() });
  }
  
  const userData = messageCounts.get(key);
  if (Date.now() - userData.timestamp > 10000) {
    userData.count = 0;
    userData.timestamp = Date.now();
  }
  
  userData.count++;
  if (userData.count > 5 && !message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
    try {
      await message.delete();
      const warning = await message.channel.send(`<:no:1122370713932795997> ${message.author}, você está enviando mensagens muito rápido.`);
      setTimeout(() => warning.delete().catch(() => {}), 5000);
      await message.member.timeout(600000, 'Spam detectado.');
      
      const embed = {
        color: 0xfe3838,
        title: '<:1000046494:1340401256392298536> Punição aplicada',
        description: `${message.author} (\`${message.author.id}\`) foi mutado(a) por spam.`,
        footer: { text: `${client.user.tag}`, icon_url: client.user.displayAvatarURL() },
        timestamp: new Date(),
      };
      message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
    } catch (error) {
      console.error('Erro ao processar antispam:', error);
    }
    return true;
  }
  return false;
}

async function handleCommands(message, client) {
  const prefix = getPrefix(message.guild.id);
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command = client.commands.get(commandName);
  if (!command) return;

  if (!userAcceptedTerms(message.author.id)) {
    return sendTermsMessage(message);
  }

  try {
    await command.execute(message, args, { setPrefix, getPrefix });
    setTimeout(() => message.delete().catch(() => {}), 10);
  } catch (error) {
    console.error(`[ERROR] Erro ao executar o comando "${commandName}":`, error);
    const embedErro = {
      color: 0xfe3838,
      author: { name: 'Erro ao executar o comando.', icon_url: 'http://bit.ly/4aIyY9j' },
    };
    await message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
  }
}

function loadSettings(path) {
  try {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch (error) {
    return {};
  }
}

function userAcceptedTerms(userId) {
  return db.prepare('SELECT user_id FROM accepted_users WHERE user_id = ?').get(userId);
}

async function sendTermsMessage(message) {
  const embed = {
    color: 0xfe3838,
    title: 'Termos de Uso',
    description: 'Aceite os Termos para usar o Punishment.',
    footer: { text: 'Obrigado por utilizar o Punishment!' },
  };
  
  const row = { type: 1, components: [
    { type: 2, label: 'Ler Termos', style: 5, url: 'https://docs.google.com/document/d/12-nG-vY0bhgIzsaO2moSHjh7QeCrQLSGd7W2XYDMXsk/mobilebasic' },
    { type: 2, custom_id: 'accept_terms', label: 'Aceitar Termos', style: 3 },
  ]};
  
  await message.reply({ embeds: [embed], components: [row], allowedMentions: { repliedUser: false } });
}
