'use strict';

const mongoose = require('mongoose');

const GuildSettingsSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    unique: true
  },
  logChannelId: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('GuildSettings', GuildSettingsSchema);
