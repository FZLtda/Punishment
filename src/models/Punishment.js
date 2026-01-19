'use strict';

const { Schema, model } = require('mongoose');

const PunishmentSchema = new Schema(
  {
    guildId: {
      type: String,
      required: true,
      index: true
    },

    userId: {
      type: String,
      required: true,
      index: true
    },

    moderatorId: {
      type: String,
      required: true
    },

    action: {
      type: String,
      required: true,
      lowercase: true
    },

    reason: {
      type: String,
      default: 'Não especificado.'
    },

    duration: {
      type: String,
      default: null
    },

    channelId: {
      type: String,
      default: null
    }
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false
    }
  }
);

module.exports = model('Punishment', PunishmentSchema);
