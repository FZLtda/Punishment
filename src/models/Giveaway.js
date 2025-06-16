const mongoose = require('mongoose');

const giveawaySchema = new mongoose.Schema({
  guild_id: String,
  channel_id: String,
  message_id: String,
  prize: String,
  duration: Number,
  winners: Number,
  end_time: Number,
  participants: {
    type: [String],
    default: [],
  },
});

module.exports = mongoose.model('Giveaway', giveawaySchema);
