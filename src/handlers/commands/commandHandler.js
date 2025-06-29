'use strict';

const { EmbedBuilder, PermissionsBitField, Client, Message } = require('discord.js');
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
    const existing = db.prepare('SELECT 1 FROM command_usage WHERE command_name = ?').get(commandName);

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
 * @param {Message} message
 * @param {Client} client
 * @returns {Promise<boolean>}
 */
async function handleCommands(message, client) {
  if (!message.guild || message.author.bot) return false;

  const prefix = await getPrefix(message.guild.id) || '.';
  if (!message.content.startsWith(prefix)) return false;

  const rawContent = message.content.slice(prefix.length).trim();
  const [commandNameRaw, ...args] = rawContent.split(/\s+/);
  const commandName = commandNameRaw?.toLowerCase();
  if (!commandName) return false;

  logger.debug(`[handleCommands] Prefixo usado na guild "${message.guild.name}": "${prefix}"`);
  logger.debug(`[handleCommands] Comando solicitado: "${commandName}"`);

  if (!client.commands || typeof client.commands.get !== 'function') {
    logger.error('[handleCommands] client.commands não está disponível ou mal inicializado');
    return false;
  }

  const command = client.commands.get(commandName)
    || client.commands.find(cmd => Array.isArray(cmd.aliases) && cmd.aliases.includes(commandName));

  if (!command) {
    logger.warn(`[handleCommands] Nenhum comando encontrado para: "${commandName}"`);
    logger.debug(`[handleCommands] Comandos disponíveis: ${[...client.commands.keys()].join(', ')}`);
    return false;
  }

  try {
    logger.info(`[handleCommands] Executando "${command.name}" de ${message.author.tag} em ${message.guild.name}`);

    // Termos de uso
    const termsAccepted = await checkTerms?.(message);
    if (!termsAccepted) return false;

    // Verificar permissões do bot
    if (command.botPermissions) {
      const botPerms = message.channel?.permissionsFor(client.user);
      if (!botPerms?.has(command.botPermissions, true)) {
        const embed = new EmbedBuilder()
          .setColor(colors.red)
          .setAuthor({
            name: 'Permissões insuficientes para o bot.',
            iconURL: emojis.icon_error,
          })
          .setDescription(`Permissões necessárias:\n\`${command.botPermissions.join(', ')}\``);

        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
      }
    }

    // Verificar permissões do usuário
    if (command.userPermissions) {
      const userPerms = message.channel?.permissionsFor(message.member);
      if (!userPerms?.has(command.userPermissions, true)) {
        const embed = new EmbedBuilder()
          .setColor(colors.red)
          .setAuthor({
            name: 'Você não tem permissão para usar este comando.',
            iconURL: emojis.icon_error,
          })
          .setDescription(`Permissões necessárias:\n\`${command.userPermissions.join(', ')}\``);

        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
      }
    }

    // Registrar estatísticas e executar
    await handleCommandUsage(command.name);
    await command.execute(message, args, { client, getPrefix, setPrefix });

    // Apagar mensagem do usuário (se configurado)
    if (command.deleteMessage) {
      message.delete().catch(err =>
        logger.warn(`[handleCommands] Não foi possível apagar mensagem de ${message.author.tag}: ${err.message}`)
      );
    }

    return true;

  } catch (err) {
    logger.error(`[handleCommands] Erro ao executar "${commandName}" de ${message.author.tag}: ${err.message}`, {
      stack: err.stack,
      guild: message.guild?.name,
      channel: message.channel?.name,
      content: message.content,
    });

    const embedErro = new EmbedBuilder()
      .setColor(colors.yellow)
      .setAuthor({
        name: 'Erro ao processar o comando.',
        iconURL: emojis.icon_attention,
      })
      .setDescription('Ocorreu um erro inesperado ao executar o comando. Tente novamente mais tarde.');

    await message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    return false;
  }
}

module.exports = { handleCommands };
