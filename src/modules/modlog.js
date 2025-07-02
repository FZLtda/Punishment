'use strict';

const { EmbedBuilder, ChannelType } = require('discord.js');
const { colors, emojis } = require('@config');
const GuildSettings = require('@models/GuildSettings');
const Logger = require('@logger');

/**
 * Envia um log de moderação para o canal configurado no MongoDB
 * @param {import('discord.js').Guild} guild
 * @param {{
 *   action: string,
 *   target?: import('discord.js').User | null,
 *   moderator: import('discord.js').User,
 *   reason?: string,
 *   channel?: import('discord.js').TextChannel,
 *   extraFields?: { name: string, value: string, inline?: boolean }[]
 * }} options
 */
async function sendModLog(
  guild,
  {
    action,
    target = null,
    moderator,
    reason = 'Não especificado.',
    channel = null,
    extraFields = []
  }
) {
  try {
    const config = await GuildSettings.findOne({ guildId: guild.id });
    if (!config?.logChannelId) {
      Logger.warn(`Canal de logs não configurado para o servidor ${guild.name} (${guild.id})`);
      return;
    }

    const logChannel = guild.channels.cache.get(config.logChannelId);
    if (!logChannel || logChannel.type !== ChannelType.GuildText) {
      Logger.warn(`Canal de log inválido para o servidor ${guild.name} (${guild.id})`);
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`🔔 Ação de moderação: ${action}`)
      .setColor(colors.red)
      .addFields(
        {
          name: '👤 Usuário',
          value: target ? `${target.tag} (\`${target.id}\`)` : 'Não especificado',
          inline: true
        },
        {
          name: '🛠️ Moderador',
          value: `${moderator.tag} (\`${moderator.id}\`)`,
          inline: true
        },
        {
          name: '📄 Motivo',
          value: reason,
          inline: false
        },
        ...(channel
          ? [{ name: '💬 Canal', value: `${channel}`, inline: true }]
          : []),
        ...extraFields
      )
      .setTimestamp()
      .setFooter({
        text: 'Punishment • Log de Moderação',
        iconURL: moderator.displayAvatarURL({ dynamic: true })
      });

    await logChannel.send({ embeds: [embed] });
    Logger.info(`Log enviado para ${guild.name} (${guild.id}) → ${action}`);
  } catch (err) {
    Logger.error(`Falha ao enviar log para ${guild.name} (${guild.id}): ${err.stack || err.message}`);
  }
}

module.exports = { sendModLog };
