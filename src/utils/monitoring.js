'use strict';

const axios = require('axios');
const logger = require('@utils/logger');
const { BOT_NAME, BOT_LOGO, colors, emojis } = require('@config');

const WEBHOOK = process.env.WEBHOOK;

function monitorBot(client) {
  if (!client || typeof client.on !== 'function') {
    throw new Error('O client não foi inicializado corretamente.');
  }

  logger.info('Monitorando o bot...');

  client.on('ready', () => {
    const tag = client.user?.tag || 'Desconhecido';
    logger.info(`[${BOT_NAME}] está online como: ${tag}`);
    sendWebhookNotification(`${BOT_NAME} Status`, `**${tag}** foi iniciado com sucesso.`);
  });

  client.on('shardDisconnect', (_event, shardId) => {
    logger.warn(`Shard ${shardId} desconectada!`);
    sendWebhookNotification(
      '🔴 Shard Desconectada',
      `A shard **#${shardId}** foi desconectada. Verifique imediatamente.`
    );
  });

  client.on('error', (error) => {
    logger.error(`Erro detectado: ${error.message}`, { stack: error.stack });
    sendWebhookNotification('Erro Detectado', `\`\`\`js\n${error.message}\n\`\`\``);
  });

  client.on('warn', (info) => {
    logger.warn(`Aviso: ${info}`);
    sendWebhookNotification('Aviso do Sistema', `\`\`\`js\n${info}\n\`\`\``);
  });
}

async function sendWebhookNotification(title, description) {
  if (!WEBHOOK) {
    logger.warn('Webhook não configurado. Ignorando notificação.');
    return;
  }

  try {
    const parsedColor = parseColor(colors.green);

    const embed = {
      color: parsedColor,
      title: truncate(title, 256),
      description: truncate(description, 4096),
      timestamp: new Date().toISOString(),
      footer: {
        text: `${BOT_NAME}`,
      },
    };

    const payload = {
      username: BOT_NAME,
      embeds: [embed],
    };

    if (isValidURL(BOT_LOGO)) {
      payload.avatar_url = BOT_LOGO;
    }

    await axios.post(WEBHOOK, payload);
    logger.info('Notificação enviada via Webhook.');
  } catch (error) {
    logger.error(`Falha ao enviar notificação via Webhook: ${error.message}`, {
      stack: error.stack,
      status: error.response?.status,
      response: error.response?.data,
    });
  }
}

function parseColor(value) {
  if (typeof value === 'string') {
    return parseInt(value.replace('#', ''), 16);
  }
  if (typeof value === 'number') return value;
  return 0x2ecc71;
}

function truncate(text, maxLength) {
  return typeof text === 'string' && text.length > maxLength
    ? text.slice(0, maxLength - 3) + '...'
    : text;
}

function isValidURL(url) {
  return typeof url === 'string' && url.startsWith('http');
}

module.exports = monitorBot;
