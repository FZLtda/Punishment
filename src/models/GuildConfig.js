const { Schema, model } = require('mongoose');

const GuildConfigSchema = new Schema({
  guildId: { type: String, required: true, unique: true },
  prefix: { type: String, default: '!' },
}, { timestamps: true });

module.exports = model('GuildConfig', GuildConfigSchema);
