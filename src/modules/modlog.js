'use strict';

const { EmbedBuilder, ChannelType, TextChannel, User, Guild } = require('discord.js');
const GuildSettings = require('@models/GuildSettings');
const { colors, bot, emojis } = require('@config');
const Logger = require('@logger');

const ACTIONS_WITHOUT_USER = new Set(['clear', 'lock', 'unlock']);
const ACTIONS_WITHOUT_REASON = new Set(['clear']);

/**
 * Monta os campos principais para o embed de moderação.
 * 
 * @param {string} action - Nome da ação realizada.
 * @param {User|null} target - Usuário alvo da ação (se aplicável).
 * @param {User} moderator - Usuário que realizou a ação.
 * @param {string} reason - Motivo da ação.
 * @param {TextChannel|null} channel - Canal relacionado (se aplicável).
 * @param {Array<{ name: string, value: string, inline?: boolean }>} extraFields - Campos adicionais.
 * @returns {Array<{ name: string, value: string, inline?: boolean }>}
 */
function buildEmbedFields(action, target, moderator, reason, channel, extraFields) {
  const fields = [];

  if (target && !ACTIONS_WITHOUT_USER.has(action.toLowerCase())) {
    fields.push({
      name: 'Usuário',
      value: `${target.tag} (\`${target.id}\`)`,
      inline: true
    });
  }

  fields.push({
    name: 'Moderador',
    value: `${moderator.tag} (\`${moderator.id}\`)`,
    inline: true
  });

  if (reason && !ACTIONS_WITHOUT_REASON.has(action.toLowerCase())) {
    fields.push({
      name: 'Motivo',
      value: reason,
      inline: false
    });
  }

  if (channel) {
    fields.push({
      name: 'Canal',
      value: `${channel}`,
      inline: true
    });
  }

  if (Array.isArray(extraFields) && extraFields.length > 0) {
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
        name: 'Histórico de Ações',
        iconURL: emojis.attentionIcon
      })
      .addFields(
        { name: 'Ação', value: action, inline: false },
        ...buildEmbedFields(action, target, moderator, reason, channel, extraFields)
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
