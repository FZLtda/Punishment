const mongoose = require('mongoose');

const giveawaySchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    trim: true,
  },
  channelId: {
    type: String,
    required: true,
    trim: true,
  },
  messageId: {
    type: String,
    required: true,
    index: true,
    trim: true,
  },
  prize: {
    type: String,
    required: true,
    trim: true,
  },
  duration: {
    type: Number,
    required: true,
    min: 1000,
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
    trim: true,
  },
  participants: {
    type: [String],
    default: [],
  },
  winners: {
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
