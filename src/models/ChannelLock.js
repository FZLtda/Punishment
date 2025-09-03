'use strict';

const { Schema, model } = require('mongoose');

const ChannelLockSchema = new Schema({
  guildId: { type: String, required: true },
  channelId: { type: String, required: true },
  messageId: { type: String, required: true }
});

module.exports = model('ChannelLock', ChannelLockSchema);
