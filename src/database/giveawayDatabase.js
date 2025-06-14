const db = require('better-sqlite3')('database.sqlite');

module.exports = {
    saveGiveaway(guildId, channelId, messageId, prize, durationMs, winners, endTime) {
        db.prepare(`
            INSERT INTO giveaways (guild_id, channel_id, message_id, prize, duration, winners, end_time, participants)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(guildId, channelId, messageId, prize, durationMs, winners, endTime, JSON.stringify([]));
    },

    getGiveaway(messageId) {
        return db.prepare('SELECT * FROM giveaways WHERE message_id = ?').get(messageId);
    },

    deleteGiveaway(messageId) {
        db.prepare('DELETE FROM giveaways WHERE message_id = ?').run(messageId);
    }
};
