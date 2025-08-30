'use strict';

const fetch = require('node-fetch');
const ERROR_WEBHOOK = process.env.ERROR_WEBHOOK;

/**
 * Envia logs críticos para o Discord via Webhook
 */
async function sendToWebhook(level, message) {
  if (!ERROR_WEBHOOK) return;

  const embed = {
    embeds: [
      {
        title: `Punishment - ${level.toUpperCase()}`,
        color: level === 'fatal' ? 0x8B0000 : 0xFF0000,
        description: `\`\`\`\n${message.slice(0, 4000)}\n\`\`\``,
        timestamp: new Date().toISOString(),
      },
    ],
  };

  try {
    await fetch(ERROR_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(embed),
    });
  } catch (err) {
    console.error('Falha ao enviar log para o Discord:', err.message);
  }
}

module.exports = { sendToWebhook };
