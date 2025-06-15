const fs = require('fs');
const path = require('path');

const commandsPath = path.join(__dirname, '..', 'commands');

function getAllCategories() {
  const files = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  const categories = new Set();
  for (const file of files) {
    const command = require(path.join(commandsPath, file));
    if (command?.category) categories.add(command.category);
  }
  return Array.from(categories);
}

function getCommandsByCategory(category) {
  const files = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  return files.map(file => require(path.join(commandsPath, file))).filter(cmd => cmd.category === category);
}

module.exports = { getAllCategories, getCommandsByCategory };
