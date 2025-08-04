const GuildConfig = require('@models/GuildConfig');

async function getPrefix(guildId) {
  if (!guildId) return process.env.DEFAULT_PREFIX;

  try {
    const config = await GuildConfig.findOne({ guildId });
    return config?.prefix || process.env.DEFAULT_PREFIX;
  } catch (err) {
    console.error(`[PrefixManager] Erro ao buscar prefixo: ${err.message}`);
    return process.env.DEFAULT_PREFIX;
  }
}

module.exports = { getPrefix };
