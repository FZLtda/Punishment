const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.resolve(__dirname, "../data/database.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS mod_actions (...);
  CREATE TABLE IF NOT EXISTS warnings (...);
  CREATE TABLE IF NOT EXISTS giveaways (...);
  CREATE TABLE IF NOT EXISTS accepted_users (...);
`);

module.exports = db;
