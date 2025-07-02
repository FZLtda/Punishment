'use strict';

const { WebhookClient } = require('discord.js');
const { colors } = require('@config');

const LOGO_BOT = process.env.LOGO_BOT;
const MONITOR_WEBHOOK_URL = process.env.MONITOR_WEBHOOK_URL;

/**
 * Envia um log de erro crítico para o canal de monitoramento
 * @param {string} title
 * @param {string | Error} content
 */
async function reportErrorToWebhook(title, content) {
  if (!MONITOR_WEBHOOK_URL) return;

  const webhook = new WebhookClient({ url: MONITOR_WEBHOOK_URL });
  const description =
    content instanceof Error ? `\`\`\`js\n${content.stack}\n\`\`\`` : String(content);

  try {
    await webhook.send({
      username: 'Punishment',
      avatarURL: LOGO_BOT,
      embeds: [
        {
          title: `${title}`,
          description,
          color: 0xff5555,
          timestamp: new Date().toISOString(),
          footer: {
            text: 'Punishment'
          }
        }
      ]
    });
  } catch (err) {
    console.error('[Webhook Monitor] Falha ao enviar erro:', err);
  }
}

module.exports = { reportErrorToWebhook };
