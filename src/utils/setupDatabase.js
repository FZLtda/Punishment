const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, '../data/database.sqlite');
const db = new Database(dbPath);

db.prepare(`
  CREATE TABLE IF NOT EXISTS warnings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    guild_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    moderator_id TEXT NOT NULL,
    timestamp INTEGER NOT NULL
  )
`).run();

console.log('Tabela warnings recriada com sucesso.');