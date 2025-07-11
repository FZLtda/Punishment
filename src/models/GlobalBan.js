'use strict';

const { Schema, model } = require('mongoose');

const GlobalBanSchema = new Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  reason: {
    type: String,
    default: 'Sem motivo fornecido.'
  },
  bannedAt: {
    type: Date,
    default: Date.now
  },
  bannedBy: {
    type: String,
    required: true
  }
});

module.exports = model('GlobalBan', GlobalBanSchema);
