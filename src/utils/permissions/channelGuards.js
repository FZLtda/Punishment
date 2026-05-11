"use strict";

const { PermissionsBitField } = require("discord.js");

/**
 * Verifica se o canal está bloqueado para mensagens.
 * @param {import('discord.js').TextChannel} channel
 * @returns {Promise<boolean>} true se bloqueado, false caso contrário
 */
async function checkChannelLock(channel) {
  try {
    if (!channel?.isTextBased?.()) {
      return false;
    }

    const everyoneRole = channel.guild?.roles?.everyone;
    if (!everyoneRole) {
      return false;
    }

    const overwrite = channel.permissionOverwrites.cache.get(everyoneRole.id);
    if (!overwrite) {
      return false;
    }

    return overwrite.deny.has(PermissionsBitField.Flags.SendMessages);
  } catch (error) {
    console.error(`[Guard: checkChannelLock] Erro ao verificar bloqueio no canal ${channel?.id}:`, error);
    return false;
  }
}

module.exports = { checkChannelLock };

