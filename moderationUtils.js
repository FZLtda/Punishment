const db = require('./database');

function logModerationAction(guildId, moderatorId, actionType, targetId, reason = 'Sem motivo') {
  const stmt = db.prepare(
    'INSERT INTO mod_actions (guild_id, moderator_id, action_type, target_id, reason) VALUES (?, ?, ?, ?, ?)'
  );
  stmt.run(guildId, moderatorId, actionType, targetId, reason);
}

module.exports = { logModerationAction };