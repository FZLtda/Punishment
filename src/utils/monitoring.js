const axios = require('axios');
const WEBHOOK = process.env.WEBHOOK;
const { BOT_NAME } = require('../config/settings.json');
function monitorBot(client) {
  if (!client || typeof client.on !== 'function') {
    throw new Error('O client não foi inicializado corretamente.');
  }

  console.log('INFO: Monitorando o bot...');

  client.on('ready', () => {
    console.log(`INFO: [${BOT_NAME}] está online como: ${client.user.tag}`);
    sendWebhookNotification(`${BOT_NAME} está online!`, 'Tudo está funcionando perfeitamente.');
  });

  client.on('shardDisconnect', (event, shardId) => {
    console.error(`ALERTA: Shard ${shardId} desconectada!`);
    sendWebhookNotification(
      `${BOT_NAME} desconectado!`,
      `A shard ${shardId} foi desconectada. Verifique imediatamente.`
    );
  });

  client.on('error', (error) => {
    console.error(`ERRO: Erro detectado: ${error.message}`);
    sendWebhookNotification(`${BOT_NAME} erro!`, `Erro detectado: ${error.message}`);
  });

  client.on('warn', (info) => {
    console.info(`AVISO: ${info}`);
    sendWebhookNotification(`${BOT_NAME} aviso!`, `Aviso detectado: ${info}`);
  });
}

async function sendWebhookNotification(title, description) {
  if (!WEBHOOK) {
    console.info('AVISO: URL do Webhook não configurada.');
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
    console.log('INFO: Notificação enviada via Webhook.');
  } catch (error) {
    console.error('ERRO: Falha ao enviar notificação via Webhook:', error.message);
  }
}

module.exports = monitorBot;
