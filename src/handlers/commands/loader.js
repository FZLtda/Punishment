const fs = require('fs');
const path = require('path');
const Logger = require('@logger/index');

async function loadCommands(client) {
  const commandsPath = path.join(__dirname, '../../../src/commands');
  const categories = fs.readdirSync(commandsPath);

  for (const category of categories) {
    const categoryPath = path.join(commandsPath, category);

    // Verifica se é uma pasta mesmo
    if (!fs.lstatSync(categoryPath).isDirectory()) continue;

    const commandFiles = fs
      .readdirSync(categoryPath)
      .filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const filePath = path.join(categoryPath, file);
      try {
        const command = require(filePath);

        if (!command.name || typeof command.execute !== 'function') {
          Logger.warn(`Comando inválido em ${filePath}`);
          continue;
        }

        client.commands.set(command.name, command);
        Logger.info(`Comando carregado: ${category}/${command.name}`);
      } catch (err) {
        Logger.error(`Erro ao carregar ${filePath}: ${err.message}`);
      }
    }
  }
}

module.exports = {
  loadCommands
};
