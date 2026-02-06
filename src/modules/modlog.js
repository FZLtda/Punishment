'use strict';

const {
  EmbedBuilder,
  ChannelType,
  TextChannel,
  User,
  GuildMember
} = require('discord.js');

const GuildSettings = require('@models/GuildSettings');
const { colors, bot, emojis } = require('@config');
const Logger = require('@logger');

/**
 * Resolve dinamicamente os campos relacionados ao alvo da ação.
 *
 * @param {*} target
 * @returns {string[]}
 */
function resolveTargetLines(target) {
  if (!target) return [];

  // User
  if (target instanceof User) {
    return [
      `**Usuário:** ${target.tag} (\`${target.id}\`)`
    ];
  }

  // GuildMember
  if (target instanceof GuildMember) {
    return [
      `**Usuário:** ${target.user.tag} (\`${target.user.id}\`)`
    ];
  }

  // Emoji
  if (typeof target.imageURL === 'function' && target.id) {
    return [
      `**Nome:** ${target.name}`,
      `**ID:** ${target.id}`
    ];
  }

  // Fallback seguro
  if (typeof target === 'object' && target.id) {
    return [
      `**ID:** ${target.id}`
    ];
  }

  return [];
}

/**
 * Constrói a descrição do embed de forma segura e inteligente.
 */
function buildEmbedDescription({
  action,
  target,
  moderator,
  reason,
  channel,
  extraFields
}) {
  const lines = [];

  // Moderador (sempre)
  if (moderator?.tag && moderator?.id) {
    lines.push(`**Moderador:** ${moderator.tag} (\`${moderator.id}\`)`);
  }

  // Target dinâmico
  lines.push(...resolveTargetLines(target));

  // Motivo
  if (reason) {
    lines.push(`**Motivo:** ${reason}`);
  }

  // Canal
  if (channel) {
    lines.push(`**Canal:** ${channel}`);
  }

  // Campos extras
  if (Array.isArray(extraFields)) {
    for (const field of extraFields) {
      if (field?.name && field?.value) {
        lines.push(`**${field.name}:** ${field.value}`);
      }
    }
  }

  // Ação (sempre por último)
  lines.push(`**Ação:** ${String(action).toLowerCase()}`);

  return lines.join('\n');
}

/**
 * Envia um log de moderação formatado.
 */
async function sendModLog(guild, options) {
  const {
    action,
    target = null,
    moderator,
    reason = 'Não especificado.',
    channel = null,
    extraFields = []
  } = options;

  const context = `[MODLOG][${guild?.id ?? 'unknown'}]`;

  try {
    if (!guild?.id) {
      return Logger.warn(`${context} Guild inválida.`);
    }

    const config = await GuildSettings.findOne({ guildId: guild.id });
    if (!config?.logChannelId) {
      return Logger.warn(`${context} Canal de logs não configurado.`);
    }

    const logChannel = guild.channels.cache.get(config.logChannelId);
    if (!(logChannel instanceof TextChannel) || logChannel.type !== ChannelType.GuildText) {
      return Logger.warn(`${context} Canal de logs inválido.`);
    }

    const embed = new EmbedBuilder()
      .setColor(colors.yellow)
      .setAuthor({
        name: 'Registro de Moderação',
        iconURL: emojis.logs
      })
      .setDescription(
        buildEmbedDescription({
          action,
          target,
          moderator,
          reason,
          channel,
          extraFields
        })
      )
      .setTimestamp()
      .setFooter({
        text: bot.name,
        iconURL: guild.client.user.displayAvatarURL({ dynamic: true })
      });

    await logChannel.send({ embeds: [embed] });
    Logger.info(`${context} Log enviado: ${action}`);
  } catch (error) {
    Logger.error(`${context} Falha ao enviar log: ${error.stack || error.message}`);
  }
}

module.exports = { sendModLog };
