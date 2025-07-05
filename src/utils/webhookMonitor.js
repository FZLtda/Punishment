'use strict';

const { WebhookClient, EmbedBuilder } = require('discord.js');
const { colors } = require('@config');

const LOGO_BOT = process.env.LOGO_BOT || null;
const MONITOR_WEBHOOK_URL = process.env.MONITOR_WEBHOOK_URL || null;

/**
 * Envia logs críticos ou status para o webhook de monitoramento do bot.
 * @param {string} title - Título da notificação.
 * @param {string | Error} content - Mensagem ou erro capturado.
 * @param {'info' | 'error'} type - Tipo de mensagem (define cor e tom).
 */

async function reportErrorToWebhook(title, content, type = 'error') {
  const isError = content instanceof Error;
  const description = isError
    ? `\`\`\`js\n${truncate(content.stack || content.message, 1900)}\n\`\`\``
    : truncate(String(content), 2048);

  const embed = new EmbedBuilder()
    .setTitle(`${title}`)
    .setDescription(description)
    .setColor(type === 'info' ? colors.green : colors.red)
    .setTimestamp()
    .setFooter({ text: 'Punishment', iconURL: LOGO_BOT });

  if (!MONITOR_WEBHOOK_URL) {
    console.warn('[Webhook Monitor] URL do webhook não definida. Log local:');
    console.warn(`[${type.toUpperCase()}] ${title}\n${description}`);
    return;
  }

  const webhook = new WebhookClient({ url: MONITOR_WEBHOOK_URL });

  try {
    await webhook.send({
      username: 'Punishment',
      avatarURL: LOGO_BOT,
      embeds: [embed]
    });
  } catch (err) {
    console.error('[Webhook Monitor] Falha ao enviar erro para o webhook:', err);
  }
}

/**
 * Trunca uma string se for maior que o limite.
 * @param {string} text
 * @param {number} max
 * @returns {string}
 */

function truncate(text, max) {
  return text.length > max ? text.slice(0, max - 3) + '...' : text;
}

module.exports = { reportErrorToWebhook };
