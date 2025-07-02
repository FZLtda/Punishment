const mongoose = require('mongoose');

const GiveawaySchema = new mongoose.Schema({
  messageId: String,
  channelId: String,
  guildId: String,
  prize: String,
  winners: Number,
  endsAt: Date,
  createdBy: String,
  status: {
    type: String,
    enum: ['ativo', 'encerrado', 'cancelado'],
    default: 'ativo'
  },
  participants: [String]
}, {
  timestamps: true
});

module.exports = mongoose.model('Giveaway', GiveawaySchema);
