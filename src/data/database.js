const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.resolve(__dirname, '@data/database.db'));

db.prepare(`
  CREATE TABLE IF NOT EXISTS mod_actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    moderator_id TEXT NOT NULL,
    action_type TEXT NOT NULL,
    target_id TEXT,
    reason TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

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

db.prepare(`
  CREATE TABLE IF NOT EXISTS giveaways (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    message_id TEXT NOT NULL,
    prize TEXT NOT NULL,
    duration INTEGER NOT NULL,
    winners INTEGER NOT NULL,
    end_time INTEGER NOT NULL,
    participants TEXT DEFAULT '[]'
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS terms (
    user_id TEXT PRIMARY KEY
  )
`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS command_usage (
  command_name TEXT PRIMARY KEY,
  usage_count INTEGER DEFAULT 0
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS prefixes (
  guild_id TEXT PRIMARY KEY,
  prefix TEXT NOT NULL
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS verified_users (
    user_id TEXT PRIMARY KEY
  );
`).run();

module.exports = db;
