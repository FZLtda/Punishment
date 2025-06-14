const path = require('path');
const { PermissionsBitField } = require('discord.js');
const { loadSettings } = require('../utils/loadSettings');
const logger = require('../utils/logger');

const ANTI_LINK_PATH = path.join(__dirname, '..', 'data', 'antilink.json');

async function handleAntiLink(message) {
  if (!message.guild || !message.member || !message.channel || message.author.bot) return false;

  const settings = loadSettings(ANTI_LINK_PATH);
  const guildSettings = settings[message.guild.id];

  if (!guildSettings?.enabled) return false;

  const containsLink = (/(?:https?:\/\/|www\.)\S+|discord(?:\.gg|app\.com\/invite)\/[^\s]+/i).test(message.content);
  const isExempt = message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers);

  if (!containsLink || isExempt) return false;

  try {
    await message.delete();

    const warnMsg = await message.channel.send({
      content: `${message.author}, links não são permitidos neste servidor.`,
      allowedMentions: { users: [message.author.id], roles: [] },
    });

    setTimeout(() => warnMsg.delete().catch(() => {}), 5000);

    logger.warn('Mensagem com link removida', {
      user: `${message.author.tag} (${message.author.id})`,
      guild: `${message.guild.name} (${message.guild.id})`,
      channel: `${message.channel.name} (${message.channel.id})`,
      content: message.content.slice(0, 150),
    });

    return true;
  } catch (error) {
    logger.error('Erro ao processar link detectado', {
      error: error.message,
      stack: error.stack,
      user: `${message.author.tag} (${message.author.id})`,
      guild: `${message.guild.name} (${message.guild.id})`,
      channel: `${message.channel.name} (${message.channel.id})`,
    });
  }

  return false;
}

module.exports = { handleAntiLink };
