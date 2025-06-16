const { Schema, model } = require('mongoose');

const warningSchema = new Schema({
  guildId: String,
  userId: String,
  reason: String,
  modId: String,
  date: { type: Date, default: Date.now }
});

module.exports = model('Warning', warningSchema);
