const { PermissionsBitField } = require('discord.js');
const { loadSettings } = require('../utils/loadSettings');
const logger = require('../utils/logger');

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
      const warning = await message.channel.send(`${message.author}, você está enviando mensagens muito rápido.`);
      setTimeout(() => warning.delete().catch(() => {}), 5000);
      await message.member.timeout(600000, 'Spam detectado.');

      const embed = {
        color: 0xfe3838,
        title: 'Punição aplicada',
        description: `${message.author} foi mutado(a) por spam.`,
        footer: { text: client.user.tag, icon_url: client.user.displayAvatarURL() },
        timestamp: new Date(),
      };
      message.channel.send({ embeds: [embed] });
      return true;
    } catch (error) {
      logger.error('ERRO: Erro ao processar antispam:', error);
    }
  }
  return false;
}

module.exports = { handleAntiSpam };