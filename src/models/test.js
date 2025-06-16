const { Schema, model } = require('mongoose');

const testSchema = new Schema({
  userId: String,
  content: String,
  date: { type: Date, default: Date.now }
});

module.exports = model('Test', testSchema);
