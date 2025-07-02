'use strict';

const { EmbedBuilder, ChannelType } = require('discord.js');
const { colors, emojis } = require('@config');
const GuildSettings = require('@models/GuildSettings');

/**
 * Envia um log de moderação para o canal configurado no MongoDB
 * @param {import('discord.js').Guild} guild
 * @param {{
 *   action: string,
 *   target: import('discord.js').User,
 *   moderator: import('discord.js').User,
 *   reason?: string,
 *   extraFields?: { name: string, value: string, inline?: boolean }[]
 * }} options
 */
async function sendModLog(guild, { action, target, moderator, reason = 'Não especificado.', extraFields = [] }) {
  try {
    const config = await GuildSettings.findOne({ guildId: guild.id });
    if (!config || !config.logChannelId) return;

    const canal = guild.channels.cache.get(config.logChannelId);
    if (!canal || canal.type !== ChannelType.GuildText) return;

    const embed = new EmbedBuilder()
      .setTitle(`🔔 Ação de moderação: ${action}`)
      .setColor(colors.red)
      .addFields(
        { name: '👤 Usuário', value: `${target} (\`${target.id}\`)`, inline: true },
        { name: '🛠️ Moderador', value: `${moderator} (\`${moderator.id}\`)`, inline: true },
        { name: '📄 Motivo', value: reason, inline: false },
        ...extraFields
      )
      .setTimestamp()
      .setFooter({
        text: 'Punishment • Log de Moderação',
        iconURL: moderator.displayAvatarURL({ dynamic: true })
      });

    await canal.send({ embeds: [embed] }).catch(() => null);
  } catch (err) {
    console.error(`[ModLog] Falha ao enviar log: ${err.stack || err.message}`);
  }
}

module.exports = { sendModLog };
