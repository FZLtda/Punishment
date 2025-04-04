const db = require('../data/database');

function getPrefix(guildId) {
  const result = db
    .prepare('SELECT prefix FROM prefixes WHERE guild_id = ?')
    .get(guildId);

  return result ? result.prefix : '.';
}

function setPrefix(guildId, newPrefix) {
  db.prepare(
    'INSERT INTO prefixes (guild_id, prefix) VALUES (?, ?) ON CONFLICT(guild_id) DO UPDATE SET prefix = ?'
  ).run(guildId, newPrefix, newPrefix);
}

module.exports = { setPrefix };