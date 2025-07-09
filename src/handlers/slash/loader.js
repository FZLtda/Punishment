const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
const Logger = require('@logger/index');

async function loadSlashCommands(client) {
  const commandsPath = path.join(__dirname, '../../../src/interactions/slash');
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  const slashCommands = [];

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    try {
      const command = require(filePath);

      if (!command.data || typeof command.execute !== 'function') {
        Logger.warn(`Slash inválido em ${file}`);
        continue;
      }

      client.slashCommands.set(command.data.name, command);
      slashCommands.push(command.data.toJSON());

      Logger.info(`[loadSlashCommands] Slash carregado: /${command.data.name}`);
    } catch (err) {
      Logger.error(`[loadSlashCommands] Não foi possível carregar slash: ${file}: ${err.message}`);
    }
  }

  // Aguarda login completo antes do deploy
  client.once('ready', async () => {
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    const isGlobal = process.env.COMMAND_SCOPE === 'global';
    const route = isGlobal
      ? Routes.applicationCommands(client.user.id)
      : Routes.applicationGuildCommands(client.user.id, process.env.TEST_GUILD_ID);

    try {
      Logger.info(`[loadSlashCommands] Enviando slash commands para a API do Discord [${isGlobal ? 'GLOBAL' : 'GUILD'}]...`);

      await rest.put(route, { body: slashCommands });

      Logger.info('[loadSlashCommands] Slash commands registrados com sucesso');
    } catch (err) {
      Logger.error(`[loadSlashCommands] Não foi possível registrar slash commands: ${err.message}`);
    }
  });
}

module.exports = {
  loadSlashCommands
};
