const fs = require('fs');
const path = require('path');

function loadSettings(relativePath) {
  try {
    const resolvedPath = path.resolve(__dirname, '..', relativePath);
    const dir = path.dirname(resolvedPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(resolvedPath)) {
      fs.writeFileSync(resolvedPath, JSON.stringify({}, null, 2), 'utf8');
    }

    return JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
  } catch (error) {
    console.error(`Erro ao carregar configurações de ${relativePath}:`, error);
    return {};
  }
}

module.exports = { loadSettings };
