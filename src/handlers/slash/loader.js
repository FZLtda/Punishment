const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
const Logger = require('@logger/index');

async function loadSlashCommands(client) {
  const commandsPath = path.join(__dirname, '../../../interactions/slash');
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

      Logger.success(`Slash carregado: /${command.data.name}`);
    } catch (err) {
      Logger.error(`Erro ao carregar slash ${file}: ${err.message}`);
    }
  }

  // Publicação no Discord
  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  try {
    Logger.info('Enviando slash commands para a API do Discord...');

    // Registrar globalmente (recomenda-se durante deploy final)
    // await rest.put(Routes.applicationCommands(client.user.id), { body: slashCommands });

    // Registrar em guilda específica (mais rápido para testes)
    await rest.put(
      Routes.applicationGuildCommands(client.user.id, process.env.TEST_GUILD_ID),
      { body: slashCommands }
    );

    Logger.success('Slash commands registrados com sucesso!');
  } catch (err) {
    Logger.error(`Erro ao registrar slash commands: ${err.message}`);
  }
}

module.exports = {
  loadSlashCommands
};
