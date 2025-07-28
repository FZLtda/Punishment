'use strict';

const { getPrefix } = require('@utils/prefixManager');
const Logger = require('@logger');
const checkTerms = require('@middlewares/checkTerms');
const checkGlobalBan = require('@middlewares/checkGlobalBan');
const checkUserPermissions = require('@utils/checkUserPermissions');
const checkBotPermissions = require('@utils/checkBotPermissions');
const { sendWarning } = require('@utils/embedWarning');

/**
 * Determina o prefixo do servidor dinamicamente.
 * Suporta customizações futuras via injeção de dependências.
 */
async function resolvePrefix(client, guildId) {
  if (client.getPrefix) return await client.getPrefix(guildId);
  return await getPrefix(guildId);
}

/**
 * Verifica se o conteúdo da mensagem é um comando válido.
 */
function parseCommand(messageContent, prefix) {
  if (!messageContent.startsWith(prefix)) return null;

  const args = messageContent.slice(prefix.length).trim().split(/\s+/);
  const commandName = args.shift()?.toLowerCase();

  if (!commandName || ['__proto__', 'constructor', 'prototype'].includes(commandName)) return null;

  return { commandName, args };
}

/**
 * Executa um pipeline de validações antes de executar o comando.
 */
async function preExecutionPipeline({ message, command, member, botMember }) {
  // Global Ban
  if (await checkGlobalBan(message)) return false;

  // Termos
  const accepted = await checkTerms({
    user: message.author,
    client: message.client,
    reply: opts => message.channel.send(opts),
  });

  if (!accepted) {
    Logger.info(`[TERMS] ${message.author.tag} não aceitou os termos.`);
    return false;
  }

  // Permissões do usuário
  if (command.userPermissions) {
    const has = await checkUserPermissions(member, message, command.userPermissions);
    if (!has) return false;
  }

  // Permissões do bot
  if (command.botPermissions) {
    const has = await checkBotPermissions(botMember, message, command.botPermissions);
    if (!has) return false;
  }

  return true;
}

/**
 * Handler do evento messageCreate.
 */
module.exports = {
  name: 'messageCreate',

  /**
   * Evento que escuta mensagens e executa comandos prefixados.
   * @param {import('discord.js').Message} message
   */
  async execute(message) {
    try {
      if (!message.guild || message.author.bot) return;

      const prefix = await resolvePrefix(message.client, message.guild.id);
      const parsed = parseCommand(message.content, prefix);
      if (!parsed) return;

      const { commandName, args } = parsed;
      const command = message.client.commands.get(commandName)
        ?? message.client.commands.find(cmd => cmd.aliases?.includes(commandName));

      if (!command) return;

      const member = await message.guild.members.fetch(message.author.id);
      const botMember = message.guild.members.me;

      const canProceed = await preExecutionPipeline({ message, command, member, botMember });
      if (!canProceed) return;

      if (command.deleteMessage) {
        try {
          await message.delete();
        } catch (err) {
          Logger.warn(`[DELETE] Falha ao apagar msg de ${message.author.tag}: ${err.message}`);
        }
      }

      await command.execute(message, args);

    } catch (error) {
      Logger.error(`[ERROR][${message?.guild?.name}] Comando falhou: ${error.stack || error}`);

      if (message?.channel?.send) {
        await sendWarning(message, 'Não foi possível executar o comando.');
      }
    }
  }
};
