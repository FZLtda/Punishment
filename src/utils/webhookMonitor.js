const { WebhookClient } = require('discord.js');

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
      username: '🛡️ Monitor',
      avatarURL: 'https://i.imgur.com/ZoYQm4J.png', // Opcional
      embeds: [
        {
          title: `🚨 ${title}`,
          description,
          color: 0xff5555,
          timestamp: new Date().toISOString()
        }
      ]
    });
  } catch (err) {
    console.error('[Webhook Monitor] Falha ao enviar erro:', err);
  }
}

module.exports = { reportErrorToWebhook };
