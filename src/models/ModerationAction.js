'use strict';

const mongoose = require('mongoose');

const ModerationActionSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    index: true
  },
  targetId: {
    type: String,
    required: true,
    index: true
  },
  executorId: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['ban', 'kick', 'mute', 'warn'],
    required: true
  },
  reason: {
    type: String,
    default: 'Não especificado.'
  },
  roleId: {
    type: String,
    default: null
  },
  actionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  expiresAt: {
    type: Date,
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: false }
});

module.exports = mongoose.model('ModerationAction', ModerationActionSchema);
