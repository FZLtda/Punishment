const mongoose = require('mongoose');

const TermsSchema = new mongoose.Schema({
  userId: { type: String, unique: true, required: true },
  acceptedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Terms', TermsSchema);
