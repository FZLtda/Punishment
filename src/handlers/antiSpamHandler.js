const { PermissionsBitField } = require('discord.js');
const { loadSettings } = require('../utils/loadSettings.js');

const ANTI_SPAM_PATH = './data/antispam.json';
const messageCounts = new Map();

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

module.exports = { handleAntiSpam };
