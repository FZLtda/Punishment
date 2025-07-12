'use strict';

const { getPrefix } = require('@utils/prefixManager');
const Logger = require('@logger');
const { sendEmbed } = require('@utils/embedReply');
const checkTerms = require('@middlewares/checkTerms');
const checkGlobalBan = require('@middlewares/checkGlobalBan');
const checkUserPermissions = require('@utils/checkUserPermissions');
const checkBotPermissions = require('@utils/checkBotPermissions');

// Cooldowns em memória
const cooldowns = new Map();

module.exports = {
  name: 'messageCreate',

  /**
   * Evento que escuta mensagens e executa comandos prefixados.
   * @param {import('discord.js').Message} message
   */
  async execute(message) {
    try {
      if (!message.guild || message.author.bot) return;

      // Verifica se o usuário está globalmente banido
      if (await checkGlobalBan(message) === true) return;

      // Obtém prefixo com fallback
      let prefix;
      try {
        prefix = message.client.getPrefix
          ? await message.client.getPrefix(message.guild.id)
          : await getPrefix(message.guild.id);
      } catch (err) {
        Logger.warn(`[PREFIX] Erro ao buscar prefixo, usando padrão (!): ${err.message}`);
        prefix = '.';
      }

      if (!message.content.startsWith(prefix)) return;

      // Parse de argumentos
      const args = message.content.slice(prefix.length).trim().split(/\s+/);
      const commandName = args.shift()?.toLowerCase();
      if (!commandName || ['__proto__', 'constructor', 'prototype'].includes(commandName)) return;

      // Busca comando (com aliases)
      const command =
        message.client.commands.get(commandName) ??
        message.client.commands.find(cmd => cmd.aliases?.includes(commandName));

      if (!command) return;

      // Verifica aceite de termos
      const accepted = await checkTerms({
        user: message.author,
        client: message.client,
        reply: opts => message.channel.send({ content: opts.content }) // sem ephemeral
      });

      if (!accepted) {
        Logger.info(`[TERMS] ${message.author.tag} bloqueado por não aceitar os termos.`);
        return;
      }

      // Cooldown
      const cooldownKey = `${message.author.id}_${command.name}`;
      const now = Date.now();
      const cooldownTime = command.cooldown || 3000;

      if (cooldowns.has(cooldownKey) && cooldowns.get(cooldownKey) > now) {
        return sendEmbed('yellow', message, 'Espere um pouco antes de usar esse comando novamente.');
      }

      cooldowns.set(cooldownKey, now + cooldownTime);

      // Permissões
      const member = await message.guild.members.fetch(message.author.id);
      const botMember = message.guild.members.me;

      if (command.userPermissions) {
        const hasPermission = await checkUserPermissions(message, member, command.userPermissions);
        if (!hasPermission) return;
      }

      if (command.botPermissions) {
        const hasPermission = await checkBotPermissions(message, botMember, command.botPermissions);
        if (!hasPermission) return;
      }

      // Deleta mensagem original se necessário
      if (command.deleteMessage) {
        try {
          await message.delete();
        } catch (err) {
          Logger.warn(`[DELETE] Não foi possível apagar mensagem de ${message.author.tag}: ${err.message}`);
        }
      }

      // Log de uso
      Logger.info(`[CMD] ${message.author.tag} usou "${command.name}" em "${message.guild.name}" (#${message.channel.name})`);

      // Executa o comando com tratamento de erro isolado
      try {
        await command.execute(message, args);
      } catch (err) {
        Logger.error(`[CMD: ${command.name}] Erro durante execução: ${err.stack || err}`);
        await sendEmbed('red', message, 'Erro ao executar este comando.');
      }

      // Métrica simples
      if (!message.client.metrics) message.client.metrics = new Map();
      message.client.metrics.set(command.name, (message.client.metrics.get(command.name) || 0) + 1);

    } catch (error) {
      Logger.error(`[EVENT: messageCreate] Erro inesperado: ${error.stack || error}`);
      if (message?.channel) {
        await sendEmbed('yellow', message, 'Ocorreu um erro inesperado.');
      }
    }
  }
};
