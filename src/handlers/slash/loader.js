'use strict';

const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
const Logger = require('@logger');

async function loadSlashCommands(client) {
  const commandsPath = path.join(__dirname, '../../../src/commands/slash');

  if (!fs.existsSync(commandsPath)) {
    Logger.warn(`[loadSlashCommands] Pasta não encontrada: ${commandsPath}`);
    return;
  }

  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  const slashCommands = [];

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    try {
      const command = require(filePath);

      if (!command.data || typeof command.execute !== 'function') {
        Logger.warn(`[loadSlashCommands] Slash inválido: ${file}`);
        continue;
      }

      client.slashCommands.set(command.data.name, command);
      slashCommands.push(command.data.toJSON());

      Logger.info(`[loadSlashCommands] Slash carregado: /${command.data.name}`);
    } catch (err) {
      Logger.error(`[loadSlashCommands] Erro ao carregar ${file}: ${err.message}`);
    }
  }

  if (!slashCommands.length) {
    Logger.warn('[loadSlashCommands] Nenhum slash carregado. Deploy abortado.');
    return;
  }

  client.once('ready', async () => {
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    const isGlobal = process.env.COMMAND_SCOPE === 'global';
    const route = isGlobal
      ? Routes.applicationCommands(client.user.id)
      : Routes.applicationGuildCommands(client.user.id, process.env.TEST_GUILD_ID);

    try {
      // teste
      await rest.put(Routes.applicationCommands(client.user.id), { body: [] });
      // teste
      Logger.info(`[loadSlashCommands] Enviando slash commands para API [${isGlobal ? 'GLOBAL' : 'GUILD'}]...`);
      await rest.put(route, { body: slashCommands });
      Logger.info('[loadSlashCommands] Slash commands registrados com sucesso!');
    } catch (err) {
      Logger.error(`[loadSlashCommands] Falha ao registrar slash commands: ${err.message}`);
    }
  });
}

module.exports = {
  loadSlashCommands
};
