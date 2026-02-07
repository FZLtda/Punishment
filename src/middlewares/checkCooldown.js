'use strict';

const { Collection } = require('discord.js');
const { sendWarning } = require('@embeds/embedWarning');

const cooldowns = new Collection();

/**
 * @param {Object} options
 * @param {import('discord.js').Message} options.message
 * @param {Object} options.command
 */
module.exports = async function checkCooldown({ message, command }) {
  const cooldownTime = (command.cooldown ?? 3) * 1000;

  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownTime;

    if (now < expirationTime) {
      const timeLeft = ((expirationTime - now) / 1000).toFixed(1);

      await sendWarning(
        message,
        `Aguarde ${timeLeft}s para usar este comando novamente.`
      );

      return false;
    }
  }

  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownTime);

  return true;
};
