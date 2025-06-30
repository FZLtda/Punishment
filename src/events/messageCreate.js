'use strict';

const { Events, Message, Client } = require('discord.js');
const handlers = require('@handleEvent');
const { getPrefix } = require('@utils/prefixUtils');
const logger = require('@utils/logger');

const cooldowns = new Map();
const prefixCache = new Map();

/**
 * Retorna o prefixo do servidor com cache temporário de 5 minutos.
 * @param {string} guildId
 * @returns {Promise<string>}
 */
async function getCachedPrefix(guildId) {
  if (prefixCache.has(guildId)) return prefixCache.get(guildId);

  try {
    const prefix = (await getPrefix(guildId)) || '-';
    prefixCache.set(guildId, prefix);
    setTimeout(() => prefixCache.delete(guildId), 5 * 60 * 1000);
    return prefix;
  } catch (err) {
    logger.warn(`[PrefixCache] Erro ao obter prefixo da guild ${guildId}: ${err.message}`);
    return '-';
  }
}

module.exports = {
  name: Events.MessageCreate,

  /**
   * Evento disparado quando uma nova mensagem é criada.
   * @param {Message} message - Mensagem recebida.
   * @param {Client} client - Instância do bot.
   */
  async execute(message, client) {
    if (!message.guild || message.author.bot) return;

    try {
      const { id: userId, tag } = message.author;
      const now = Date.now();

      // Cooldown global simples (1 segundo)
      const lastUsage = cooldowns.get(userId) || 0;
      if (now - lastUsage < 1000) return;
      cooldowns.set(userId, now);

      logger.debug(`[MessageCreate] ${tag} => "${message.content}"`);

      // Handlers independentes
      if (await handlers.handleAIResponse?.(message)) return;
      if (await handlers.handleAntiLink?.(message)) return;
      if (await handlers.handleAntiSpam?.(message, client)) return;

      // Prefixo
      const prefix = await getCachedPrefix(message.guild.id);
      logger.debug(`[MessageCreate] Prefixo usado: "${prefix}"`);

      if (!message.content.startsWith(prefix)) return;

      // Termos de uso
      const accepted = await handlers.checkTerms?.(message);
      if (!accepted) return;

      if (!client.commands?.size) {
        logger.warn('[MessageCreate] Nenhum comando carregado em client.commands!');
        return;
      }

      // Execução do comando
      const success = await handlers.handleCommands?.(message, client);
      if (!success) {
        logger.debug(`[MessageCreate] Nenhum comando correspondente encontrado para: ${message.content}`);
      }

    } catch (error) {
      logger.error('[MessageCreate] Erro ao processar mensagem', {
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
          content: [
            '**[MessageCreate]**',
            `👤 Autor: \`${message.author?.tag}\``,
            `🛡️ Servidor: \`${message.guild?.name}\``,
            `💬 Mensagem: \`${message.content.slice(0, 100)}\``,
            '```js',
            (error.stack?.slice(0, 1900) || 'Erro sem stack'),
            '```',
          ].join('\n'),
        }).catch(() => {});
      }
    }
  },
};
