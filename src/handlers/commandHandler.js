const logger = require('../utils/logger');
const db = require('../data/database');
const { getPrefix, setPrefix } = require('../utils/prefixUtils');

async function handleCommandUsage(commandName) {
  const command = db
    .prepare('SELECT * FROM command_usage WHERE command_name = ?')
    .get(commandName);

  if (command) {
    db.prepare('UPDATE command_usage SET usage_count = usage_count + 1 WHERE command_name = ?').run(commandName);
  } else {
    db.prepare('INSERT INTO command_usage (command_name, usage_count) VALUES (?, 1)').run(commandName);
  }
}

async function handleCommands(message, client) {
  const prefix = getPrefix(message.guild.id);
  if (!message.content.startsWith(prefix)) return false;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command = client.commands.get(commandName);
  if (!command) return false;

  try {
    await handleCommandUsage(commandName);

    await command.execute(message, args, { client, getPrefix, setPrefix });

    await message.delete().catch((err) => {
      logger.info(`Não foi possível apagar a mensagem do comando: ${err.message}`);
    });

    return true;
  } catch (error) {
    logger.error(`Erro ao executar o comando "${commandName}":`, error);
    await message.reply({
      content: '<:1000042883:1336044555354771638> Não foi possível processar o comando.',
      allowedMentions: { repliedUser: false },
    });
    return false;
  }
}

module.exports = { handleCommands };
