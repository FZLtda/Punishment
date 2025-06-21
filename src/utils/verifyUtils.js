const db = require('@data/database');

function userAlreadyVerified(userId) {
  const result = db.prepare('SELECT 1 FROM verified_users WHERE user_id = ?').get(userId);
  return !!result;
}

function markUserVerified(userId) {
  db.prepare('INSERT OR IGNORE INTO verified_users (user_id) VALUES (?)').run(userId);
}

module.exports = {
  userAlreadyVerified,
  markUserVerified,
};
