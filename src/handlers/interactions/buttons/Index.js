const fs = require('fs');
const path = require('path');

const handlers = {};

const files = fs
  .readdirSync(__dirname)
  .filter(file => file !== 'index.js' && file.endsWith('.js'));

for (const file of files) {
  const name = path.basename(file, '.js');
  try {
    handlers[name] = require(path.join(__dirname, file));
  } catch (error) {
    console.error(`[Handler Loader] Não foi possível carregar o arquivo: '${file}':`, error);
  }
}

module.exports = handlers;
