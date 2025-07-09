'use strict';

const { EmbedBuilder, ChannelType } = require('discord.js');
const GuildSettings = require('@models/GuildSettings');
const { colors, bot } = require('@config');
const Logger = require('@logger');

/**
 * Envia um log de moderação para o canal configurado.
 * @param {import('discord.js').Guild} guild - Servidor de origem.
 * @param {{
 *   action: string,
 *   target?: import('discord.js').User | null,
 *   moderator: import('discord.js').User,
 *   reason?: string,
 *   channel?: import('discord.js').TextChannel,
 *   extraFields?: { name: string, value: string, inline?: boolean }[]
 * }} options - Dados do log.
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
    const { id: guildId, name: guildName, channels, client } = guild;

    const config = await GuildSettings.findOne({ guildId });
    if (!config?.logChannelId) {
      Logger.warn(`Canal de logs não configurado para o servidor ${guildName} (${guildId})`);
      return;
    }

    const logChannel = channels.cache.get(config.logChannelId);
    if (!logChannel || logChannel.type !== ChannelType.GuildText) {
      Logger.warn(`Canal de log inválido no servidor ${guildName} (${guildId})`);
      return;
    }

    const fields = [
      {
        name: 'Usuário',
        value: target ? `${target.tag} (\`${target.id}\`)` : 'Não especificado',
        inline: true
      },
      {
        name: 'Moderador',
        value: `${moderator.tag} (\`${moderator.id}\`)`,
        inline: true
      },
      {
        name: 'Motivo',
        value: reason,
        inline: false
      },
      ...(channel
        ? [{ name: 'Canal', value: `${channel}`, inline: true }]
        : []),
      ...extraFields
    ];

    const embed = new EmbedBuilder()
      .setTitle(`Ação de moderação: ${action}`)
      .setColor(colors.red)
      .addFields(fields)
      .setTimestamp()
      .setFooter({
        text: bot.name,
        iconURL: client.user.displayAvatarURL({ dynamic: true })
      });

    await logChannel.send({ embeds: [embed] });

    Logger.info(`Log de moderação enviado para ${guildName} (${guildId}): ${action}`);
  } catch (error) {
    Logger.error(`Erro ao registrar log de moderação em ${guild.name} (${guild.id}): ${error.stack || error.message}`);
  }
}

module.exports = { sendModLog };
