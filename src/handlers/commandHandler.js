const { EmbedBuilder } = require('discord.js');
const logger = require('../utils/logger');
const db = require('../data/database');
const { getPrefix, setPrefix } = require('../utils/prefixUtils');
const { yellow, red } = require('../config/colors.json');
const { icon_attention, icon_error } = require('../config/emoji.json');
const { checkTerms } = require('../handlers/termsHandler');

async function handleCommandUsage(commandName) {
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
}

async function handleCommands(message, client) {
  const prefix = await getPrefix(message.guild.id) || '!';
  if (!message.content.startsWith(prefix)) return false;

  const args = message.content.slice(prefix.length).trim().split(/\s+/);
  const commandName = args.shift()?.toLowerCase();
  if (!commandName) return false;

  const command = client.commands.get(commandName);
  if (!command) return false;

  try {
    logger.info(`Comando "${commandName}" usado por ${message.author.tag} em "${message.guild.name}".`);

    const termsAccepted = await checkTerms(message);
    if (!termsAccepted) return false;

    if (command.botPermissions) {
      const botPerms = message.channel?.permissionsFor(client.user);
      if (!botPerms?.has(command.botPermissions)) {
        const embedErro = new EmbedBuilder()
          .setColor(red)
          .setAuthor({
            name: 'Permissões insuficientes para o bot executar esse comando.',
            iconURL: icon_error,
          });

        return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
      }
    }

    if (command.userPermissions) {
      const userPerms = message.channel?.permissionsFor(message.member);
      if (!userPerms?.has(command.userPermissions)) {
        const embedErro = new EmbedBuilder()
          .setColor(red)
          .setAuthor({
            name: 'Você não tem permissões suficientes para usar esse comando.',
            iconURL: icon_error,
          });

        return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
      }
    }

    await handleCommandUsage(commandName);
    await command.execute(message, args, { client, getPrefix, setPrefix });

    if (command.deleteMessage) {
      await message.delete().catch((err) => {
        logger.warn(`Não foi possível apagar a mensagem do comando "${commandName}": ${err.message}`);
      });
    }

    return true;
  } catch (err) {
    logger.error(`Erro ao executar o comando "${commandName}" de ${message.author.tag}: ${err.message}`, {
      stack: err.stack,
      guild: message.guild?.name,
      content: message.content,
    });

    const embedErro = new EmbedBuilder()
      .setColor(yellow)
      .setAuthor({
        name: 'Não foi possível processar o comando devido a um erro.',
        iconURL: icon_attention,
      });

    await message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    return false;
  }
}

module.exports = { handleCommands };
