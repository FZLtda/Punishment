const { PermissionsBitField } = require('discord.js');
const { loadSettings } = require('../utils/loadSettings');
const logger = require('../utils/logger');

const ANTI_LINK_PATH = './data/antilink.json';

async function handleAntiLink(message) {
  const settings = loadSettings(ANTI_LINK_PATH);
  if (!settings[message.guild.id]?.enabled) return false;

  const linkRegex = /(https?:\/\/|www\.)\S+/gi;
  if (linkRegex.test(message.content) && !message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
    try {
      await message.delete();
      const reply = await message.channel.send(`${message.author}, links não são permitidos neste servidor.`);
      setTimeout(() => reply.delete().catch(() => {}), 5000);
      return true;
    } catch (error) {
      logger.error('ERRO: Erro ao excluir mensagem com link:', error);
    }
  }
  return false;
}

module.exports = { handleAntiLink };
