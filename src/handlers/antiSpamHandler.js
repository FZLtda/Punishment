const { PermissionsBitField } = require('discord.js');
const { loadSettings } = require('../utils/loadSettings');
const logger = require('../utils/logger');

const ANTI_SPAM_PATH = './data/antispam.json';
const messageCounts = new Map();

const SPAM_LIMIT = 5;
const TIME_FRAME_MS = 10000;
const TIMEOUT_DURATION_MS = 10 * 60 * 1000;

async function handleAntiSpam(message, client) {
  if (!message.guild || !message.member || !message.channel) return false;

  const settings = loadSettings(ANTI_SPAM_PATH);
  const guildSettings = settings[message.guild.id];

  if (!guildSettings?.enabled) return false;

  const key = `${message.guild.id}-${message.author.id}`;

  if (!messageCounts.has(key)) {
    messageCounts.set(key, { count: 1, timestamp: Date.now() });
  } else {
    const userData = messageCounts.get(key);
    const now = Date.now();

    if (now - userData.timestamp > TIME_FRAME_MS) {
      userData.count = 1;
      userData.timestamp = now;
    } else {
      userData.count++;
    }

    if (
      userData.count > SPAM_LIMIT &&
      !message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)
    ) {
      try {
        await message.delete().catch(() => {});

        const warning = await message.channel.send(`${message.author}, você está enviando mensagens muito rápido.`);
        setTimeout(() => warning.delete().catch(() => {}), 5000);

        await message.member.timeout(TIMEOUT_DURATION_MS, 'Spam detectado.');

        const embed = {
          color: 0xfe3838,
          title: '<:Mutado:1355700779859574954> Punição aplicada',
          description: `${message.author} foi mutado(a) por spam.`,
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
        });
      }
    }
  }

  return false;
}

module.exports = { handleAntiSpam };
