'use strict';

const mongoose = require('mongoose');

const GuildSettingsSchema = new mongoose.Schema({

  guildId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  logChannelId: {
    type: String,
    default: null
  },

  logEnabledBy: {
    type: String,
    default: null
  },

  logEnabledAt: {
    type: Date,
    default: null
  },

  logDisabledBy: {
    type: String,
    default: null
  },

  logDisabledAt: {
    type: Date,
    default: null
  }

}, {
  timestamps: true
});

module.exports = mongoose.model('GuildSettings', GuildSettingsSchema);
