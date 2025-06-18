const mongoose = require('mongoose');

const backupSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  guildName: { type: String, required: true },
  authorId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  roles: { type: Array, default: [] },
  channels: { type: Array, default: [] },
});

module.exports = mongoose.model('Backup', backupSchema);
