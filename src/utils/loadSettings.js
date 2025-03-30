const fs = require('fs');

function loadSettings(path) {
  try {
    if (!fs.existsSync(path)) {
      fs.writeFileSync(path, JSON.stringify({}), 'utf8');
    }
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch (error) {
    console.error(`Erro ao carregar configurações de ${path}:`, error);
    return {};
  }
}

module.exports = { loadSettings };
