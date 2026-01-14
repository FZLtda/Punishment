'use strict';

const { getPrefix } = require('@helpers/prefixManager');
const Logger = require('@logger');
const checkTerms = require('@middlewares/checkTerms');
const checkGlobalBan = require('@middlewares/checkGlobalBan');
const checkUserPermissions = require('@permissions/checkUserPermissions');
const checkBotPermissions = require('@permissions/checkBotPermissions');
const { sendWarning } = require('@embeds/embedWarning');

async function resolvePrefix(client, guildId) {
  if (client.getPrefix) return await client.getPrefix(guildId);
  return await getPrefix(guildId);
}

function parseCommand(messageContent, prefix) {
  if (!messageContent.startsWith(prefix)) return null;
  if (messageContent[prefix.length] === ' ') return null;

  const args = messageContent.slice(prefix.length).split(/\s+/);
  const commandName = args.shift()?.toLowerCase();

  if (!commandName || ['__proto__', 'constructor', 'prototype'].includes(commandName)) {
    return null;
  }

  return { commandName, args };
}

async function preExecutionPipeline({ message, command, member, botMember }) {
  if (await checkGlobalBan(message)) return false;

  const accepted = await checkTerms({
    user: message.author,
    client: message.client,
    reply: opts => message.channel.send(opts),
  });

  if (!accepted) {
    Logger.info(`[TERMS] ${message.author.tag} não aceitou os termos.`);
    return false;
  }

  if (command.userPermissions) {
    const has = await checkUserPermissions(member, message, command.userPermissions);
    if (!has) return false;
  }

  if (command.botPermissions) {
    const has = await checkBotPermissions(botMember, message, command.botPermissions);
    if (!has) return false;
  }

  return true;
}

module.exports = {
  name: 'messageCreate',

  async execute(message) {
    try {
      if (!message.guild || message.author.bot) return;

      const prefix = await resolvePrefix(message.client, message.guild.id);
      const parsed = parseCommand(message.content, prefix);
      if (!parsed) return;

      const { commandName, args } = parsed;
      const command =
        message.client.commands.get(commandName) ??
        message.client.commands.find(cmd => cmd.aliases?.includes(commandName));

      if (!command) return;

      const member = await message.guild.members.fetch(message.author.id);
      const botMember = message.guild.members.me;

      const canProceed = await preExecutionPipeline({
        message,
        command,
        member,
        botMember,
      });

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
      Logger.error(
        `[ERROR][${message?.guild?.name ?? 'DM'}] Comando falhou:`,
        error
      );

      try {
        if (message?.channel && message.client?.isReady()) {
          await sendWarning(message, 'Não foi possível executar o comando.');
        }
      } catch (warnError) {
        Logger.warn('[messageCreate] Falha ao enviar aviso de erro', warnError);
      }
    }
  },
};
