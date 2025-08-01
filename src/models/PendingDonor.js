'use strict';

const { Schema, model } = require('mongoose');

const pendingDonorSchema = new Schema({
userId: {
type: String,
required: true,
unique: true,
},
createdAt: {
type: Date,
default: Date.now,
}
});

module.exports = model('PendingDonor', pendingDonorSchema);

