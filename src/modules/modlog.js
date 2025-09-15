'use strict';

const { EmbedBuilder, ChannelType, TextChannel, User, Guild } = require('discord.js');
const GuildSettings = require('@models/GuildSettings');
const { colors, bot, emojis } = require('@config');
const Logger = require('@logger');

const ACTIONS_WITHOUT_USER = new Set(['clear', 'lock', 'send', 'unlock']);
const ACTIONS_WITHOUT_REASON = new Set(['clear']);

/**
 * Constrói a descrição para o embed de moderação.
 *
 * @param {string} action - Ação realizada.
 * @param {User|null} target - Usuário alvo (se aplicável).
 * @param {User} moderator - Moderador responsável pela ação.
 * @param {string} reason - Motivo da ação.
 * @param {TextChannel|null} channel - Canal relacionado (se aplicável).
 * @param {Array<{ name: string, value: string }>} extraFields - Campos adicionais.
 * @returns {string} - Texto formatado para o embed.
 */
function buildEmbedDescription(action, target, moderator, reason, channel, extraFields) {
  const lines = [
    `**Moderador:** ${moderator.tag} (\`${moderator.id}\`)`
  ];

  if (target && !ACTIONS_WITHOUT_USER.has(action.toLowerCase())) {
    lines.push(`**Usuário:** ${target.tag} (\`${target.id}\`)`);
  }

  if (reason && !ACTIONS_WITHOUT_REASON.has(action.toLowerCase())) {
    lines.push(`**Motivo:** ${reason}`);
  }

  if (channel) {
    lines.push(`**Canal:** ${channel}`);
  }

  if (Array.isArray(extraFields) && extraFields.length > 0) {
    for (const { name, value } of extraFields) {
      lines.push(`**${name}:** ${value}`);
    }
  }

  lines.push(`**Ação:** ${action.toLowerCase()}`);

  return lines.join('\n');
}

/**
 * Envia um log de moderação formatado para o canal configurado.
 *
 * @param {Guild} guild - Servidor onde ocorreu a ação.
 * @param {{
 *   action: string,
 *   target?: User|null,
 *   moderator: User,
 *   reason?: string,
 *   channel?: TextChannel|null,
 *   extraFields?: Array<{ name: string, value: string }>
 * }} options - Detalhes do log de moderação.
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
      return Logger.warn(`${context} Objeto 'guild' inválido.`);
    }

    const config = await GuildSettings.findOne({ guildId: guild.id });
    if (!config?.logChannelId) {
      return Logger.warn(`${context} Nenhum canal de logs configurado.`);
    }

    const logChannel = guild.channels.cache.get(config.logChannelId);
    if (!(logChannel instanceof TextChannel) || logChannel.type !== ChannelType.GuildText) {
      return Logger.warn(`${context} Canal de log configurado é inválido ou não é de texto.`);
    }

    const embed = new EmbedBuilder()
      .setColor(colors.yellow)
      .setAuthor({
        name: 'Registro de Moderação',
        iconURL: emojis.logs
      })
      .setDescription(
        buildEmbedDescription(action, target, moderator, reason, channel, extraFields)
      )
      .setTimestamp()
      .setFooter({
        text: bot.name,
        iconURL: guild.client.user.displayAvatarURL({ dynamic: true })
      });

    await logChannel.send({ embeds: [embed] });
    Logger.info(`${context} Log de moderação enviado: ${action}`);
  } catch (error) {
    Logger.error(`${context} Falha ao enviar log: ${error.stack || error.message}`);
  }
}

module.exports = { sendModLog };
