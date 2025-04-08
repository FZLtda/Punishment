const axios = require('axios');
const logger = require('./logger');
const WEBHOOK = process.env.WEBHOOK;
const { BOT_NAME } = require('../config/settings.json');

function monitorBot(client) {
  if (!client || typeof client.on !== 'function') {
    throw new Error('O client não foi inicializado corretamente.');
  }

  logger.info('Monitorando o bot...');

  client.on('ready', () => {
    logger.info(`[${BOT_NAME}] está online como: ${client.user.tag}`);
    sendWebhookNotification(`${BOT_NAME} está online!`, 'Tudo está funcionando perfeitamente.');
  });

  client.on('shardDisconnect', (event, shardId) => {
    logger.info(`Shard ${shardId} desconectada!`);
    sendWebhookNotification(
      `${BOT_NAME} desconectado!`,
      `A shard ${shardId} foi desconectada. Verifique imediatamente.`
    );
  });

  client.on('error', (error) => {
    logger.error(`Erro detectado: ${error.message}`);
    sendWebhookNotification(`${BOT_NAME} erro!`, `Erro detectado: ${error.message}`);
  });

  client.on('warn', (info) => {
    logger.info(`${info}`);
    sendWebhookNotification(`${BOT_NAME} aviso!`, `Aviso detectado: ${info}`);
  });
}

async function sendWebhookNotification(title, description) {
  if (!WEBHOOK) {
    logger.info('URL do Webhook não configurada.');
    return;
  }

  const embed = {
    color: 0x2ecc71,
    title,
    description,
    timestamp: new Date().toISOString(),
    footer: {
      text: `${BOT_NAME} Monitoramento`,
    },
  };

  try {
    await axios.post(WEBHOOK, {
      username: 'Punishment Status',
      avatar_url: 'https://bit.ly/3Ybrvul',
      embeds: [embed],
    });
    logger.info('Notificação enviada via Webhook.');
  } catch (error) {
    logger.info('Falha ao enviar notificação via Webhook:', error.message);
  }
}

module.exports = monitorBot;
