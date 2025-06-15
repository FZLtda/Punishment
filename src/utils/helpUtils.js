const fs = require('fs');
const path = require('path');

function getCategories(commandsPath) {
  return fs.readdirSync(commandsPath).filter(dir =>
    fs.statSync(path.join(commandsPath, dir)).isDirectory()
  );
}

function getCommandsByCategory(commandsPath, category) {
  const categoryPath = path.join(commandsPath, category);
  const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.js'));

  return files.map(file => {
    const cmd = require(path.join(categoryPath, file));
    return {
      name: cmd?.name || 'sem-nome',
      description: cmd?.description || 'sem descrição'
    };
  });
}

module.exports = {
  getCategories,
  getCommandsByCategory,
};
