'use strict';

const { EmbedBuilder, ChannelType, TextChannel, User, Guild } = require('discord.js');
const GuildSettings = require('@models/GuildSettings');
const { colors, bot } = require('@config');
const Logger = require('@logger');

/**
 * Gera os campos para o embed de moderação.
 * @param {User|null} target
 * @param {User} moderator
 * @param {string} reason
 * @param {TextChannel|null} channel
 * @param {Array<{ name: string, value: string, inline?: boolean }>} extraFields
 * @returns {Array<{ name: string, value: string, inline?: boolean }>}
 */

function buildEmbedFields(target, moderator, reason, channel, extraFields) {
  const fields = [
    {
      name: '👤 Usuário',
      value: target ? `${target.tag} (\`${target.id}\`)` : 'Não especificado',
      inline: true
    },
    {
      name: '🛡️ Moderador',
      value: `${moderator.tag} (\`${moderator.id}\`)`,
      inline: true
    },
    {
      name: '📄 Motivo',
      value: reason || 'Não especificado.',
      inline: false
    }
  ];

  if (channel) {
    fields.push({
      name: '📍 Canal',
      value: `${channel}`,
      inline: true
    });
  }

  if (Array.isArray(extraFields)) {
    fields.push(...extraFields);
  }

  return fields;
}

/**
 * Envia um embed de log de moderação para o canal configurado.
 * 
 * @param {Guild} guild - Servidor onde ocorreu a ação.
 * @param {{
 *   action: string,
 *   target?: User|null,
 *   moderator: User,
 *   reason?: string,
 *   channel?: TextChannel|null,
 *   extraFields?: Array<{ name: string, value: string, inline?: boolean }>
 * }} options - Informações do log.
 */

async function sendModLog(guild, {
  action,
  target = null,
  moderator,
  reason = 'Não especificado.',
  channel = null,
  extraFields = []
}) {
  const context = `[MODLOG][${guild.id}]`;

  try {
    if (!guild || !guild.id) {
      Logger.warn(`${context} Objeto 'guild' inválido.`);
      return;
    }

    const config = await GuildSettings.findOne({ guildId: guild.id });
    if (!config?.logChannelId) {
      Logger.warn(`${context} Canal de logs não configurado.`);
      return;
    }

    const logChannel = guild.channels.cache.get(config.logChannelId);
    if (!(logChannel instanceof TextChannel) || logChannel.type !== ChannelType.GuildText) {
      Logger.warn(`${context} Canal de log configurado é inválido ou não é de texto.`);
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`📝 Ação de Moderação: ${action}`)
      .setColor(colors.red)
      .addFields(buildEmbedFields(target, moderator, reason, channel, extraFields))
      .setTimestamp()
      .setFooter({
        text: bot.name,
        iconURL: guild.client.user.displayAvatarURL({ dynamic: true })
      });

    await logChannel.send({ embeds: [embed] });

    Logger.info(`${context} Log de moderação enviado com sucesso: ${action}`);
  } catch (error) {
    Logger.error(`${context} Falha ao enviar log: ${error.stack || error.message}`);
  }
}

module.exports = { sendModLog };
