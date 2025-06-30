'use strict';

const { Events } = require('discord.js');
const eventHandlers = require('@handleEvent/index');
const commandHandler = require('@handleCommands/commandHandler');
const { getPrefix } = require('@utils/prefixUtils');
const logger = require('@utils/logger');

const cooldowns = new Map();
const prefixCache = new Map();

/**
 * Retorna o prefixo da guilda com cache temporário.
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
    logger.warn(`[PrefixCache] Erro ao obter prefixo da guilda ${guildId}: ${err.message}`);
    return '-';
  }
}

module.exports = {
  name: Events.MessageCreate,

  /**
   * Lida com mensagens recebidas no servidor.
   * @param {import('discord.js').Message} message
   * @param {import('discord.js').Client} client
   */
  async execute(message, client) {
    if (!message.guild || message.author.bot) return;

    try {
      const { id: userId, tag } = message.author;
      const content = message.content.trim();

      // Cooldown global simples (1 segundo)
      const now = Date.now();
      const lastUsage = cooldowns.get(userId) || 0;
      if (now - lastUsage < 1000) return;
      cooldowns.set(userId, now);

      logger.debug(`[MessageCreate] ${tag} => "${content}"`);

      // Handlers paralelos (AI, AntiLink, AntiSpam etc.)
      if (await eventHandlers.handleAIResponse?.(message)) return;
      if (await eventHandlers.handleAntiLink?.(message)) return;
      if (await eventHandlers.handleAntiSpam?.(message, client)) return;

      // Verificar prefixo
      const prefix = await getCachedPrefix(message.guild.id);
      logger.debug(`[MessageCreate] Prefixo em uso: "${prefix}"`);

      if (!content.startsWith(prefix)) return;

      // Termos de uso obrigatórios
      const accepted = await eventHandlers.checkTerms?.(message);
      if (!accepted) return;

      // Verificação de comandos carregados
      if (!client.commands?.size) {
        logger.warn('[MessageCreate] Nenhum comando registrado em client.commands!');
        return;
      }

      // Executar comando
      const executed = await commandHandler.handleCommands?.(message, client);
      if (!executed) {
        logger.debug(`[MessageCreate] Comando não encontrado para: "${content}"`);
      }

    } catch (error) {
      logger.error('[MessageCreate] Falha ao processar mensagem', {
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
            '**[Erro: MessageCreate]**',
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
  }
};
