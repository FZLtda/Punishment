const mongoose = require('mongoose');

const termsSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  acceptedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Terms', termsSchema);
