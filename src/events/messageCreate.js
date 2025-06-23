'use strict';

const { Events } = require('discord.js');
const handlers = require('@handleEvent');
const { getPrefix } = require('@utils/prefixUtils');
const logger = require('@utils/logger');

const cooldowns = new Map();
const prefixCache = new Map();

/**
 * Obtém o prefixo com cache de 5 minutos por servidor.
 * @param {string} guildId
 * @returns {Promise<string>}
 */
async function getCachedPrefix(guildId) {
  if (prefixCache.has(guildId)) return prefixCache.get(guildId);
  const prefix = await getPrefix(guildId);
  prefixCache.set(guildId, prefix);
  setTimeout(() => prefixCache.delete(guildId), 5 * 60 * 1000);
  return prefix;
}

module.exports = {
  name: 'messageCreate',

  /**
   * Executa quando uma nova mensagem é criada.
   * @param {import('discord.js').Message} message
   * @param {import('discord.js').Client} client
   */
  async execute(message, client) {
    if (!message.guild || message.author.bot) return;

    try {
      const now = Date.now();
      const userId = message.author.id;

      if (now - (cooldowns.get(userId) || 0) < 1000) return;
      cooldowns.set(userId, now);

      if (await handlers.handleAIResponse?.(message)) return;
      if (await handlers.handleAntiLink?.(message)) return;
      if (await handlers.handleAntiSpam?.(message, client)) return;

      const prefix = await getCachedPrefix(message.guild.id);
      if (!message.content.startsWith(prefix)) return;

      const accepted = await handlers.checkTerms?.(message);
      if (!accepted) return;

      if (!client.commands) {
        logger.warn('[messageCreate] client.commands está indefinido!');
        return;
      }

      await handlers.handleCommands?.(message, client);

    } catch (error) {
      logger.error('[Events:messageCreate] Erro ao processar mensagem', {
        message: error.message,
        stack: error.stack,
        author: message.author?.tag,
        userId: message.author?.id,
        guild: message.guild?.name,
        guildId: message.guild?.id,
        channelId: message.channel?.id,
        content: message.content,
      });

      const logChannel = client.channels.cache.get(process.env.LOG_CHANNEL);
      if (logChannel?.isTextBased?.()) {
        logChannel.send({
          content:
            '**[Erro: messageCreate]**\n' +
            `<:Desbanido:1355718942076965016> Autor: \`${message.author?.tag}\`\n` +
            `<:Backup:1355721566582997054> Servidor: \`${message.guild?.name}\`\n` +
            `<:Desbloqueado:1355700557465125064> Mensagem: \`${message.content.slice(0, 100)}\`\n` +
            '```js\n' + (error.stack?.slice(0, 1900) || 'Erro sem stack') + '\n```',
        });
      }
    }
  },
};
