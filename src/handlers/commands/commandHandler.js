'use strict';

const { EmbedBuilder } = require('discord.js');
const logger = require('@utils/logger');
const db = require('@data/database');
const { getPrefix, setPrefix } = require('@utils/prefixUtils');
const { colors, emojis } = require('@config');
const { checkTerms } = require('@handlers/termsHandler');

/**
 * Atualiza ou insere estatísticas de uso de comandos no banco.
 * @param {string} commandName
 */
async function handleCommandUsage(commandName) {
  try {
    const existing = db.prepare('SELECT * FROM command_usage WHERE command_name = ?').get(commandName);
    if (existing) {
      db.prepare('UPDATE command_usage SET usage_count = usage_count + 1 WHERE command_name = ?').run(commandName);
    } else {
      db.prepare('INSERT INTO command_usage (command_name, usage_count) VALUES (?, 1)').run(commandName);
    }
  } catch (err) {
    logger.warn(`[handleCommandUsage] Falha ao atualizar estatísticas para "${commandName}": ${err.message}`);
  }
}

/**
 * Processa comandos prefixados.
 * @param {import('discord.js').Message} message
 * @param {import('discord.js').Client} client
 * @returns {Promise<boolean>}
 */
async function handleCommands(message, client) {
  const prefix = await getPrefix(message.guild.id) || '!';
  logger.debug(`[handleCommands] Prefixo da guild "${message.guild.name}": "${prefix}"`);

  if (!message.content.startsWith(prefix)) return false;

  const raw = message.content.slice(prefix.length).trim();
  const [commandNameRaw, ...args] = raw.split(/\s+/);
  const commandName = commandNameRaw?.toLowerCase();

  logger.debug(`[handleCommands] Comando solicitado: "${commandName}"`);
  logger.debug(`[handleCommands] Comandos registrados: ${[...client.commands.keys()].join(', ')}`);

  if (!commandName) return false;

  const command = client.commands.get(commandName);
  if (!command) {
    logger.warn(`[handleCommands] Nenhum comando registrado corresponde a "${commandName}"`);
    return false;
  }

  try {
    logger.info(`[handleCommands] Executando comando "${commandName}" de ${message.author.tag} em "${message.guild.name}".`);

    // Verifica termos
    const termsAccepted = await checkTerms?.(message);
    if (!termsAccepted) return false;

    // Verifica permissões do bot
    if (command.botPermissions) {
      const botPerms = message.channel?.permissionsFor(client.user);
      if (!botPerms?.has(command.botPermissions)) {
        const embedErro = new EmbedBuilder()
          .setColor(colors.red)
          .setAuthor({
            name: 'Permissões insuficientes para o bot executar esse comando.',
            iconURL: emojis.icon_error,
          });

        return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
      }
    }

    // Verifica permissões do usuário
    if (command.userPermissions) {
      const userPerms = message.channel?.permissionsFor(message.member);
      if (!userPerms?.has(command.userPermissions)) {
        const embedErro = new EmbedBuilder()
          .setColor(colors.red)
          .setAuthor({
            name: 'Você não tem permissões suficientes para usar esse comando.',
            iconURL: emojis.icon_error,
          });

        return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
      }
    }

    // Executa comando e registra uso
    await handleCommandUsage(commandName);
    await command.execute(message, args, { client, getPrefix, setPrefix });

    if (command.deleteMessage) {
      await message.delete().catch((err) => {
        logger.warn(`[handleCommands] Falha ao deletar mensagem do comando "${commandName}": ${err.message}`);
      });
    }

    return true;

  } catch (err) {
    const logMessage = `Erro ao executar o comando "${commandName}" de ${message.author.tag}: ${err.message}`;
    logger.error(logMessage, {
      stack: err.stack,
      guild: message.guild?.name,
      content: message.content,
    });

    const embedErro = new EmbedBuilder()
      .setColor(colors.yellow)
      .setAuthor({
        name: 'Não foi possível processar o comando devido a um erro.',
        iconURL: emojis.icon_attention,
      });

    await message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    return false;
  }
}

module.exports = { handleCommands };
