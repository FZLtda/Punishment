const path = require('path');
const fs = require('fs');

const handlers = {};

const files = fs
  .readdirSync(__dirname)
  .filter(file => file !== 'index.js' && file.endsWith('.js'));

for (const file of files) {
  const handlerName = path.basename(file, '.js');

  try {
    handlers[handlerName] = require(path.join(__dirname, file));
  } catch (error) {
    console.error(`[Event Handler] Falha ao carregar '${file}': ${error.message}`);
  }
}

module.exports = handlers;
