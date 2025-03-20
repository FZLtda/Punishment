const Database = require("better-sqlite3");
const db = new Database("commands.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS commands (
    name TEXT PRIMARY KEY,
    code TEXT NOT NULL
  );
`);

module.exports = db;
