const fs = require('fs');
const path = require('path');

const prefixesPath = path.resolve(__dirname, '../data/prefixes.json');

if (!fs.existsSync(prefixesPath)) {
  fs.mkdirSync(path.dirname(prefixesPath), { recursive: true });
  fs.writeFileSync(prefixesPath, JSON.stringify({}));
}

function getPrefix(guildId) {
  const prefixes = JSON.parse(fs.readFileSync(prefixesPath, 'utf8'));
  return prefixes[guildId] || '.';
}

function setPrefix(guildId, newPrefix) {
  const prefixes = JSON.parse(fs.readFileSync(prefixesPath, 'utf8'));
  prefixes[guildId] = newPrefix;
  fs.writeFileSync(prefixesPath, JSON.stringify(prefixes, null, 4));
  console.log(`[INFO] Prefixo atualizado para o servidor ${guildId}: ${newPrefix}`);
}

module.exports = { getPrefix, setPrefix };