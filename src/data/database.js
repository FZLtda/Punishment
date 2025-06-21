const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'database.db');
const db = new Database(dbPath);

// Ações de moderação
db.prepare(`
  CREATE TABLE IF NOT EXISTS mod_actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    moderator_id TEXT NOT NULL,
    action_type TEXT NOT NULL,
    target_id TEXT,
    reason TEXT,
    timestamp INTEGER NOT NULL
  )
`).run();

// Advertências
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

// Sorteios
db.prepare(`
  CREATE TABLE IF NOT EXISTS giveaways (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    message_id TEXT NOT NULL,
    prize TEXT NOT NULL,
    duration INTEGER NOT NULL,
    winner_count INTEGER NOT NULL,
    end_time INTEGER NOT NULL,
    participants TEXT DEFAULT '[]'
  )
`).run();

// Termos aceitos
db.prepare(`
  CREATE TABLE IF NOT EXISTS terms (
    user_id TEXT PRIMARY KEY
  )
`).run();

// Uso de comandos
db.prepare(`
  CREATE TABLE IF NOT EXISTS command_usage (
    command_name TEXT PRIMARY KEY,
    usage_count INTEGER DEFAULT 0
  )
`).run();

// Prefixos por servidor
db.prepare(`
  CREATE TABLE IF NOT EXISTS prefixes (
    guild_id TEXT PRIMARY KEY,
    prefix TEXT NOT NULL
  )
`).run();

// Verificados
db.prepare(`
  CREATE TABLE IF NOT EXISTS verified_users (
    user_id TEXT PRIMARY KEY
  )
`).run();

module.exports = db;
