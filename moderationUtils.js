const db = require('./database');

function logModerationAction(moderatorId, actionType, targetId, reason = 'Sem motivo') {
  const stmt = db.prepare(
    'INSERT INTO mod_actions (moderator_id, action_type, target_id, reason) VALUES (?, ?, ?, ?)'
  );
  stmt.run(moderatorId, actionType, targetId, reason);
}

module.exports = { logModerationAction };