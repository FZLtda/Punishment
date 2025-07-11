'use strict';

const GlobalBan = require('@models/GlobalBan');
const { sendEmbed } = require('@utils/embedReply');

module.exports = async function checkGlobalBan(message) {
  if (!message || !message.author || message.author.bot) return false;

  const ban = await GlobalBan.findOne({ userId: message.author.id });
  if (ban) {
    await sendEmbed('yellow', message, 
      `Você foi banido globalmente do bot.\n**Motivo:** ${ban.reason}`);
    return true;
  }

  return false;
};
