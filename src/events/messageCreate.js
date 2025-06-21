const { Events } = require('discord.js');
const {
  handleAIResponse,
  handleAntiLink,
  handleAntiSpam,
  handleCommands,
  checkTerms
} = require('@handleEvent');
const { getPrefix } = require('@utils/prefixUtils');
const logger = require('@utils/logger');

const cooldowns = new Map();

module.exports = {
  name: Events.MessageCreate,
  /**
   * @param {import('discord.js').Message} message
   * @param {import('discord.js').Client} client
   */
  async execute(message, client) {
    if (!message.guild || message.author.bot) return;

    try {
      
      const userId = message.author.id;
      if (cooldowns.has(userId)) return;
      cooldowns.set(userId, Date.now());
      setTimeout(() => cooldowns.delete(userId), 1000);

      if (await handleAIResponse(message)) return;
      if (await handleAntiLink(message)) return;
      if (await handleAntiSpam(message, client)) return;

      const prefix = await getPrefix(message.guild.id);
      if (!message.content.startsWith(prefix)) return;

      const accepted = await checkTerms(message);
      if (!accepted) return;

      await handleCommands(message, client);

    } catch (error) {
      logger.error(`[messageCreate] ${error.message}`, {
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
