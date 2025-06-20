const { Schema, model } = require('mongoose');

const giveawaySchema = new Schema({
  messageId: { type: String, required: true, unique: true },
  channelId: { type: String, required: true },
  guildId: { type: String, required: true },
  prize: { type: String, required: true },
  winnerCount: { type: Number, default: 1 },
  participants: { type: [String], default: [] },
  winners: { type: [String], default: [] },
  hostId: { type: String, required: true },
  duration: { type: Number, required: true },
  endsAt: { type: Date, required: true },
  ended: { type: Boolean, default: false },
  createdAt: { type: Date, default: () => new Date() },
});

module.exports = model('Giveaway', giveawaySchema);
