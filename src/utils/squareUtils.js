const fetch = require('node-fetch');
const logger = require('./logger');

const SQUARE_TOKEN = process.env.SQUARE_TOKEN;
const APP_ID = process.env.SQUARE_APP_ID;

async function restartSquareApp() {
  try {
    logger.info('[SQUARE] Iniciando requisição para reiniciar o app...');

    const res = await fetch(`https://api.squarecloud.app/v2/apps/${APP_ID}/restart`, {
      method: 'POST',
      headers: {
        'Authorization': SQUARE_TOKEN,
        'Content-Type': 'application/json'
      }
    });

    const data = await res.json();

    if (res.ok) {
      logger.info('[SQUARE] Requisição enviada com sucesso. Resposta:', data);
    } else {
      logger.error(`[SQUARE] Falha na requisição: ${res.status} ${res.statusText} | Detalhes: ${JSON.stringify(data)}`);
    }

    return data;
  } catch (err) {
    logger.error(`[SQUARE] Erro ao reiniciar app na SquareCloud: ${err.message}`);
    return null;
  }
}

module.exports = { restartSquareApp };
