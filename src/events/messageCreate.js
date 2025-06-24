'use strict';

const { Events } = require('discord.js');
const handlers = require('@handleEvent');
const { getPrefix } = require('@utils/prefixUtils');
const logger = require('@utils/logger');

const cooldowns = new Map();
const prefixCache = new Map();

/**
 * Obtém o prefixo do servidor com cache de 5 minutos.
 * @param {string} guildId
 * @returns {Promise<string>}
 */
async function getCachedPrefix(guildId) {
  if (prefixCache.has(guildId)) return prefixCache.get(guildId);

  let prefix;
  try {
    prefix = await getPrefix(guildId);
  } catch (err) {
    logger.warn(`[PrefixCache] Erro ao obter prefixo da guild ${guildId}: ${err.message}`);
  }

  prefix = prefix || '-';
  prefixCache.set(guildId, prefix);
  setTimeout(() => prefixCache.delete(guildId), 5 * 60 * 1000); // 5 minutos

  return prefix;
}

module.exports = {
  name: Events.MessageCreate,

  /**
   * Evento disparado quando uma nova mensagem é criada.
   * @param {import('discord.js').Message} message
   * @param {import('discord.js').Client} client
   */
  async execute(message, client) {
    if (!message.guild || message.author.bot) return;

    try {
      const now = Date.now();
      const userId = message.author.id;

      // Cooldown simples global por usuário (1s)
      if (now - (cooldowns.get(userId) || 0) < 1000) return;
      cooldowns.set(userId, now);

      // Logs para depuração
      logger.debug(`[messageCreate] ${message.author.tag} enviou: "${message.content}"`);

      // Handlers independentes
      if (await handlers.handleAIResponse?.(message)) return;
      if (await handlers.handleAntiLink?.(message)) return;
      if (await handlers.handleAntiSpam?.(message, client)) return;

      // Verifica prefixo
      const prefix = await getCachedPrefix(message.guild.id);
      logger.debug(`[messageCreate] Prefixo detectado: "${prefix}"`);

      if (!message.content.startsWith(prefix)) return;

      // Termos de uso
      const accepted = await handlers.checkTerms?.(message);
      if (!accepted) return;

      // Comandos carregados?
      if (!client.commands) {
        logger.warn('[messageCreate] client.commands está indefinido!');
        return;
      }

      // Executa comando
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
            `👤 Autor: \`${message.author?.tag}\`\n` +
            `🛡️ Servidor: \`${message.guild?.name}\`\n` +
            `💬 Mensagem: \`${message.content.slice(0, 100)}\`\n` +
            '```js\n' + (error.stack?.slice(0, 1900) || 'Erro sem stack') + '\n```',
        }).catch(() => {});
      }
    }
  },
};
