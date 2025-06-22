'use strict';

const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const logger = require('@utils/logger');
const db = require('@data/database');
const { getPrefix, setPrefix } = require('@utils/prefixUtils');
const { colors, emojis } = require('@config');
const checkTerms = require('@handlers/termsHandler');

const DEFAULT_PREFIX = '!';

const handleCommandUsage = (commandName) => {
  try {
    const command = db
      .prepare('SELECT * FROM command_usage WHERE command_name = ?')
      .get(commandName);

    if (command) {
      db.prepare('UPDATE command_usage SET usage_count = usage_count + 1 WHERE command_name = ?')
        .run(commandName);
    } else {
      db.prepare('INSERT INTO command_usage (command_name, usage_count) VALUES (?, 1)')
        .run(commandName);
    }
  } catch (err) {
    logger.warn(`Erro ao registrar uso do comando "${commandName}": ${err.message}`);
  }
};

module.exports = async function handleCommands(message, client) {
  if (!message.guild || message.author.bot) return false;

  const prefix = await getPrefix(message.guild.id) || DEFAULT_PREFIX;
  if (!message.content.startsWith(prefix)) return false;

  const args = message.content.slice(prefix.length).trim().split(/\s+/);
  const commandName = args.shift()?.toLowerCase();
  if (!commandName) return false;

  const command = client.commands.get(commandName);
  if (!command) return false;

  logger.info(`Comando "${commandName}" usado por ${message.author.tag} em "${message.guild.name}".`);

  try {
    const accepted = await checkTerms(message);
    if (!accepted) return false;

    const botPerms = message.channel?.permissionsFor(client.user);
    const userPerms = message.channel?.permissionsFor(message.member);

    if (command.botPermissions && !botPerms?.has(command.botPermissions)) {
      const embed = new EmbedBuilder()
        .setColor(colors.red)
        .setAuthor({
          name: 'Permissões insuficientes para o bot executar esse comando.',
          iconURL: emojis.icon_error,
        });

      return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }

    if (command.userPermissions && !userPerms?.has(command.userPermissions)) {
      const embed = new EmbedBuilder()
        .setColor(colors.red)
        .setAuthor({
          name: 'Você não tem permissões suficientes para usar esse comando.',
          iconURL: emojis.icon_error,
        });

      return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }

    await handleCommandUsage(commandName);
    await command.execute(message, args, { client, getPrefix, setPrefix });

    if (command.deleteMessage) {
      await message.delete().catch(err => {
        logger.warn(`Falha ao apagar mensagem do comando "${commandName}": ${err.message}`);
      });
    }

    return true;
  } catch (err) {
    logger.error(`Erro ao executar comando "${commandName}" de ${message.author.tag}: ${err.message}`, {
      stack: err.stack,
      guild: message.guild?.name,
      content: message.content,
    });

    const embed = new EmbedBuilder()
      .setColor(colors.yellow)
      .setAuthor({
        name: 'Erro ao processar o comando.',
        iconURL: emojis.icon_attention,
      });

    await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    return false;
  }
};
