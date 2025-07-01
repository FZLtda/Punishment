const GuildConfig = require('@models/GuildConfig');

async function getPrefix(guildId) {
  const config = await GuildConfig.findOne({ guildId });
  return config?.prefix || process.env.DEFAULT_PREFIX;
}

module.exports = { getPrefix };
