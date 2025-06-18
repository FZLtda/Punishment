const mongoose = require('mongoose');

const backupSchema = new mongoose.Schema({
  guildName: String,
  guildId: { type: String, required: true },
  authorId: { type: String, required: true },
  roles: Array,
  channels: Array,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Backup', backupSchema);
