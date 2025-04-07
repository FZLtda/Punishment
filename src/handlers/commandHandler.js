const logger = require('../utils/logger');
const db = require('../data/database');
const { getPrefix, setPrefix } = require('../utils/prefixUtils');
const { error, attent } = require('../config/emoji.json');
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
  
  const prefix = await getPrefix(message.guild.id);

  if (!message.content.startsWith(prefix)) return false;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (!command) return false;

  try {

    const termsAccepted = await checkTerms(message);
    if (!termsAccepted) return;

    if (command.botPermissions) {
      const botPerms = message.channel.permissionsFor(client.user);
      if (!botPerms || !botPerms.has(command.botPermissions)) {
        return message.reply({
          content: `${error} Eu não tenho permissões suficientes para executar esse comando.`,
          allowedMentions: { repliedUser: false },
        });
      }
    }

    if (command.userPermissions) {
      const userPerms = message.channel.permissionsFor(message.member);
      if (!userPerms || !userPerms.has(command.userPermissions)) {
        return message.reply({
          content: `${error} Você não tem permissões suficientes para usar esse comando.`,
          allowedMentions: { repliedUser: false },
        });
      }
    }

    await handleCommandUsage(commandName);

    await command.execute(message, args, { client, getPrefix, setPrefix });

    if (command.deleteMessage) {
      await message.delete().catch((err) => {
        logger.info(`Não foi possível apagar a mensagem do comando: ${err.message}`);
      });
    }

    return true;
  } catch (error) {
    logger.error(`Erro ao executar o comando "${commandName}":`, error);
    await message.reply({
      content: `${attent} Não foi possível processar o comando.`,
      allowedMentions: { repliedUser: false },
    });
    return false;
  }
}

module.exports = { handleCommands };