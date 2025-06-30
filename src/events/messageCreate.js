'use strict';

const { Events } = require('discord.js');
const handlers = require('@handleEvent');
const { getPrefix } = require('@utils/prefixUtils');
const logger = require('@utils/logger');

const cooldowns = new Map(); // cooldown por usuário
const prefixCache = new Map(); // cache por guilda (5min)

/**
 * Retorna o prefixo com cache temporário por guilda.
 * @param {string} guildId
 * @returns {Promise<string>}
 */
async function getCachedPrefix(guildId) {
  if (prefixCache.has(guildId)) return prefixCache.get(guildId);

  try {
    const prefix = await getPrefix(guildId) || '-';
    prefixCache.set(guildId, prefix);
    setTimeout(() => prefixCache.delete(guildId), 5 * 60 * 1000);
    return prefix;
  } catch (err) {
    logger.warn(`[PrefixCache] Falha ao obter prefixo da guilda ${guildId}: ${err.message}`);
    return '-';
  }
}

module.exports = {
  name: Events.MessageCreate,

  /**
   * Executado sempre que uma nova mensagem é recebida.
   * @param {import('discord.js').Message} message
   * @param {import('discord.js').Client} client
   */
  async execute(message, client) {
    if (!message.guild || message.author.bot) return;

    try {
      const { id: userId, tag } = message.author;
      const content = message.content.trim();
      const now = Date.now();

      // Cooldown por usuário (1s)
      const lastUsage = cooldowns.get(userId) || 0;
      if (now - lastUsage < 1000) return;
      cooldowns.set(userId, now);

      logger.debug(`[MessageCreate] ${tag} => "${content}"`);

      // Handlers paralelos
      if (await handlers.handleAIResponse?.(message)) return;
      if (await handlers.handleAntiLink?.(message)) return;
      if (await handlers.handleAntiSpam?.(message, client)) return;

      // Verificar prefixo
      const prefix = await getCachedPrefix(message.guild.id);
      logger.debug(`[MessageCreate] Prefixo em uso: "${prefix}"`);
      if (!content.startsWith(prefix)) return;

      // Termos obrigatórios
      const accepted = await handlers.checkTerms?.(message);
      if (!accepted) return;

      // Confirmar que há comandos carregados
      if (!client.commands?.size) {
        logger.warn('[MessageCreate] Nenhum comando registrado!');
        return;
      }

      // Executar comando
      const success = await handlers.handleCommands?.(message, client);
      if (!success) {
        logger.debug(`[MessageCreate] Nenhum comando correspondente: "${content}"`);
      }

    } catch (error) {
      logger.error('[MessageCreate] Erro durante processamento', {
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
            '**[Erro: messageCreate]**',
            `👤 Autor: \`${message.author?.tag}\``,
            `🛡️ Servidor: \`${message.guild?.name}\``,
            `💬 Conteúdo: \`${message.content.slice(0, 100)}\``,
            '```js',
            error.stack?.slice(0, 1900) || 'Erro sem stack',
            '```'
          ].join('\n'),
        }).catch(() => {});
      }
    }
  }
};
