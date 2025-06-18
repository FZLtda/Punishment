const mongoose = require('mongoose');

const giveawaySchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
  },
  channelId: {
    type: String,
    required: true,
  },
  messageId: {
    type: String,
    required: true,
    index: true,
  },
  prize: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  winnerCount: {
    type: Number,
    required: true,
    min: 1,
  },
  endsAt: {
    type: Date,
    required: true,
  },
  hostId: {
    type: String,
    required: true,
  },
  participants: {
    type: [String],
    default: [],
  },
  ended: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Giveaway', giveawaySchema);
