const mongoose = require('mongoose');

const VerificationSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  channelId: { type: String, required: true },
  messageId: { type: String },
  roleId: { type: String, required: true },
  removeRoleId: { type: String },
  type: { type: String, enum: ['reaction', 'button'], default: 'button' },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Verification', VerificationSchema);
