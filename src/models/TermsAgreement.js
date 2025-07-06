const { Schema, model } = require('mongoose');

const TermsAgreementSchema = new Schema({
  userId: { type: String, required: true, unique: true },
  acceptedAt: { type: Date, default: Date.now },
});

module.exports = model('TermsAgreement', TermsAgreementSchema);
