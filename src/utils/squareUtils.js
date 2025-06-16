const fetch = require('node-fetch');

const SQUARE_TOKEN = process.env.SQUARE_TOKEN;
const APP_ID = process.env.SQUARE_APP_ID;

async function restartSquareApp() {
  try {
    const res = await fetch(`https://api.squarecloud.app/v2/apps/${APP_ID}/restart`, {
      method: 'POST',
      headers: {
        'Authorization': SQUARE_TOKEN,
        'Content-Type': 'application/json'
      }
    });

    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Erro ao reiniciar o app na SquareCloud:', err);
    return null;
  }
}

module.exports = { restartSquareApp };
