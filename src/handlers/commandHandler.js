const { getPrefix } = require('../utils/prefixes');
const logger = require('../utils/logger');

async function handleCommands(message, client) {
  const prefix = getPrefix(message.guild.id);
  if (!message.content.startsWith(prefix)) return false;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command = client.commands.get(commandName);
  if (!command) return false;

  try {
    await command.execute(message, args, client);

    await message.delete().catch((err) => {
      logger.warn(`Não foi possível apagar a mensagem do comando: ${err.message}`);
    });

    return true;
  } catch (error) {
    logger.error(`Erro ao executar o comando "${commandName}":`, error);
    await message.reply('Erro ao executar o comando.');
    return false;
  }
}

module.exports = { handleCommands };