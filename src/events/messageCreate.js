'use strict';

const { getPrefix } = require('@utils/prefixManager');
const Logger = require('@logger');
const checkTerms = require('@middlewares/checkTerms');
const checkGlobalBan = require('@middlewares/checkGlobalBan');
const checkUserPermissions = require('@utils/checkUserPermissions');
const checkBotPermissions = require('@utils/checkBotPermissions');
const { sendEmbed } = require('@utils/embedReply');

module.exports = {
  name: 'messageCreate',

  /**
   * Evento que escuta mensagens e executa comandos prefixados.
   * @param {import('discord.js').Message} message
   * @returns {Promise<void>}
   */
  async execute(message) {
    try {
      if (!message.guild || message.author.bot) return;

      // Verifica se o usuário está globalmente banido
      const isBanned = await checkGlobalBan(message);
      if (isBanned) return;

      // Obtém o prefixo do servidor
      const prefix = message.client.getPrefix
        ? await message.client.getPrefix(message.guild.id)
        : await getPrefix(message.guild.id);

      if (!message.content.startsWith(prefix)) return;

      // Processa o comando
      const args = message.content.slice(prefix.length).trim().split(/\s+/);
      const commandName = args.shift()?.toLowerCase();

      // Verifica comandos inválidos ou perigosos
      if (!commandName || ['__proto__', 'constructor', 'prototype'].includes(commandName)) return;

      // Busca o comando ou alias
      const command = message.client.commands.get(commandName)
        ?? message.client.commands.find(cmd => cmd.aliases?.includes(commandName));

      if (!command) return;

      // Verifica aceite dos termos
      const accepted = await checkTerms({
        user: message.author,
        client: message.client,
        reply: opts => message.channel.send(opts)
      });

      if (!accepted) {
        Logger.info(`[TERMS] Usuário ${message.author.tag} bloqueado por não aceitar os termos.`);
        return;
      }

      const member = await message.guild.members.fetch(message.author.id);
      const botMember = message.guild.members.me;

      // Verifica permissões do usuário
      if (command.userPermissions) {
        const hasPermission = await checkUserPermissions(member, message, command.userPermissions);
        if (!hasPermission) return;
      }

      // Verifica permissões do bot
      if (command.botPermissions) {
        const hasPermission = await checkBotPermissions(botMember, message, command.botPermissions);
        if (!hasPermission) return;
      }

      // Deleta a mensagem original, se necessário
      if (command.deleteMessage) {
        try {
          await message.delete();
        } catch (err) {
          Logger.warn(`[DELETE] Não foi possível apagar a mensagem de ${message.author.tag}: ${err.message}`);
        }
      }

      // Executa o comando
      await command.execute(message, args);

    } catch (error) {
      Logger.error(`[EXEC] Não foi possível processar o comando: ${error.stack || error}`);

      if (message?.channel?.send) {
        await sendEmbed('yellow', message, 'Não foi possível executar este comando.');
      }
    }
  }
};
