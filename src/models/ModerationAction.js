const mongoose = require('mongoose');

const ModerationActionSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  targetId: { type: String, required: true },
  executorId: { type: String, required: true },
  type: { type: String, enum: ['ban', 'kick', 'mute', 'warn'], required: true },
  reason: { type: String },
  roleId: { type: String },
  actionId: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ModerationAction', ModerationActionSchema);
