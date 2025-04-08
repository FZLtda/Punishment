const { PermissionsBitField } = require('discord.js');
const { loadSettings } = require('../utils/loadSettings');
const logger = require('../utils/logger');

const ANTI_LINK_PATH = './data/antilink.json';

const LINK_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+|discord\.gg\/[^\s]+)/gi;

async function handleAntiLink(message) {
  if (!message.guild || !message.member || !message.channel) return false;

  const settings = loadSettings(ANTI_LINK_PATH);
  const guildSettings = settings[message.guild.id];

  if (!guildSettings?.enabled) return false;

  const hasLink = LINK_REGEX.test(message.content);
  const hasPermission = message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers);

  if (hasLink && !hasPermission) {
    try {
      await message.delete().catch(() => {});

      const warning = await message.channel.send(`${message.author}, links não são permitidos neste servidor.`);
      setTimeout(() => warning.delete().catch(() => {}), 5000);

      logger.info(`Mensagem com link deletada de ${message.author.tag} em ${message.guild.name}.`);
      return true;
    } catch (error) {
      logger.error(`Erro ao deletar mensagem com link de ${message.author.tag}: ${error.message}`, {
        stack: error.stack,
        guild: message.guild.name,
      });
    }
  }

  return false;
}

module.exports = { handleAntiLink };