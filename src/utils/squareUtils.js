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
      logger.info('[SQUARE] Requisição de reinício enviada com sucesso.', { response: data });
    } else {
      logger.error(`[SQUARE] Falha na requisição: ${res.status} ${res.statusText}`, { details: data });
    }

    return data;
  } catch (err) {
    logger.error(`[SQUARE] Erro ao reiniciar app na SquareCloud: ${err.message}`);
    return { error: true, message: err.message };
  }
}

async function getSquareAppStatus() {
  try {
    logger.info('[SQUARE] Consultando status da aplicação...');

    const response = await fetch(`https://api.squarecloud.app/v2/apps/${APP_ID}`, {
      method: 'GET',
      headers: {
        Authorization: SQUARE_TOKEN
      }
    });

    const data = await response.json();

    if (!response.ok || !data.application) {
      logger.error('[SQUARE] Erro ao consultar status', { status: response.status, response: data });
      return {
        error: true,
        message: data.message || 'Estrutura inesperada da API',
        raw: data
      };
    }

    logger.info('[SQUARE] Status da aplicação recebido com sucesso.', {
      appStatus: data.application.status
    });

    return data;
  } catch (err) {
    logger.error(`[SQUARE] Falha na API SquareCloud: ${err.message}`);
    return { error: true, message: err.message };
  }
}

module.exports = {
  restartSquareApp,
  getSquareAppStatus
};
