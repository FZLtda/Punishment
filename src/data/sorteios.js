const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/sorteios.db');

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS sorteios (
            id TEXT PRIMARY KEY,
            premio TEXT,
            criado_em INTEGER,
            finaliza_em INTEGER,
            participantes TEXT
        )
    `);
});

module.exports = db;