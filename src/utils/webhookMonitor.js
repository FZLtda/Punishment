'use strict';

const { WebhookClient, EmbedBuilder } = require('discord.js');
const { colors, bot } = require('@config');
const Logger = require('@logger');

const LOGO_BOT = process.env.LOGO_BOT ?? null;
const MONITOR_WEBHOOK_URL = process.env.MONITOR_WEBHOOK_URL ?? null;

// Tipos de status permitidos
const TYPES = Object.freeze({
  INFO: 'info',
  ERROR: 'error'
});

/**
 * Envia logs críticos ou status para o webhook de monitoramento.
 * @param {string} title - Título da notificação.
 * @param {string|Error} content - Mensagem ou erro capturado.
 * @param {'info'|'error'} [type='error'] - Tipo de mensagem.
 */
async function reportErrorToWebhook(title, content, type = TYPES.ERROR) {
  const isError = content instanceof Error;

  const normalizedType = (typeof type === 'string' && ['info', 'error'].includes(type.toLowerCase()))
    ? type.toLowerCase()
    : TYPES.ERROR;

  const description = isError
    ? wrapInCodeBlock(truncate(content.stack || content.message, 1900))
    : truncate(String(content), 2048);

  const embed = new EmbedBuilder()
    .setTitle(String(title))
    .setDescription(description)
    .setColor(normalizedType === TYPES.INFO ? colors.green : colors.red)
    .setTimestamp()
    .setFooter({ text: bot.name, iconURL: LOGO_BOT });

  const logMsg = `${title} — ${isError ? content.stack || content.message : content}`;
  Logger[normalizedType](logMsg);

  if (!MONITOR_WEBHOOK_URL) {
    Logger.warn('Webhook de monitoramento não configurado. Envio remoto ignorado.');
    return;
  }

  try {
    const webhook = new WebhookClient({ url: MONITOR_WEBHOOK_URL });
    await webhook.send({
      username: bot.name,
      avatarURL: LOGO_BOT,
      embeds: [embed]
    });
    Logger.info('Notificação enviada ao webhook com sucesso.');
  } catch (err) {
    Logger.error('Não foi possível enviar log ao webhook:', err);
  }
}

/**
 * Trunca uma string para o tamanho máximo permitido.
 * @param {string} text - Texto original.
 * @param {number} max - Comprimento máximo.
 * @returns {string}
 */
function truncate(text, max) {
  return text.length > max ? `${text.slice(0, max - 3)}...` : text;
}

/**
 * Formata texto como bloco de código.
 * @param {string} text
 * @returns {string}
 */
function wrapInCodeBlock(text) {
  return `\`\`\`js\n${text}\n\`\`\``;
}

module.exports = { reportErrorToWebhook };
