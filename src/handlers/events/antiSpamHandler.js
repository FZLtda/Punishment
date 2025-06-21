const path = require('path');
const { PermissionsBitField } = require('discord.js');
const { loadSettings } = require('@utils/loadSettings');
const logger = require('@utils/logger');

const ANTI_SPAM_PATH = path.join(__dirname, '..', 'data', 'antispam.json');

const SPAM_LIMIT = 5;
const TIME_FRAME_MS = 10000;
const TIMEOUT_DURATION_MS = 10 * 60 * 1000;

const messageCounts = new Map();
const punishedUsers = new Set();

async function handleAntiSpam(message, client) {
  if (!message.guild || !message.member || !message.channel || message.author.bot) return false;

  const settings = loadSettings(ANTI_SPAM_PATH);
  const guildSettings = settings[message.guild.id];
  if (!guildSettings?.enabled) return false;

  const isExempt = message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers);
  if (isExempt) return false;

  const key = `${message.guild.id}-${message.author.id}`;
  const now = Date.now();

  let userData = messageCounts.get(key);

  if (!userData) {
    userData = { count: 1, timestamp: now };
    messageCounts.set(key, userData);
    setTimeout(() => messageCounts.delete(key), TIME_FRAME_MS);
  } else {
    if (now - userData.timestamp > TIME_FRAME_MS) {
      userData.count = 1;
      userData.timestamp = now;
    } else {
      userData.count++;
    }
  }

  if (userData.count > SPAM_LIMIT && !punishedUsers.has(key)) {
    punishedUsers.add(key);
    setTimeout(() => punishedUsers.delete(key), TIMEOUT_DURATION_MS);

    try {
      await message.delete().catch(() => {});

      const warning = await message.channel.send({
        content: `${message.author}, você está enviando mensagens muito rápido.`,
        allowedMentions: { users: [message.author.id] },
      });
      setTimeout(() => warning.delete().catch(() => {}), 5000);

      await message.member.timeout(TIMEOUT_DURATION_MS, 'Spam detectado.');

      const embed = {
        color: 0xfe3838,
        title: '<:Mutado:1355700779859574954> Punição aplicada',
        description: `${message.author} (\`${message.author.id}\`) foi mutado(a) por spam.`,
        thumbnail: { url: message.author.displayAvatarURL({ dynamic: true }) },
        footer: {
          text: client.user.tag,
          icon_url: client.user.displayAvatarURL(),
        },
        timestamp: new Date(),
      };

      await message.channel.send({ embeds: [embed] });

      logger.info(`Usuário ${message.author.tag} mutado por spam em ${message.guild.name}.`);
      return true;
    } catch (error) {
      logger.error(`Erro ao aplicar punição de spam a ${message.author.tag}: ${error.message}`, {
        stack: error.stack,
        guild: message.guild.name,
        userId: message.author.id,
      });
    }
  }

  return false;
}

module.exports = { handleAntiSpam };
