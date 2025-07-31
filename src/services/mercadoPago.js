'use strict';

const mercadopago = require('mercadopago');
require('dotenv').config();

mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

/**
 * Cria uma preferência de pagamento no Mercado Pago.
 * @param {number} amount - Valor da doação.
 * @param {string} userId - ID do usuário do Discord.
 * @returns {Promise<string>} - URL de pagamento.
 */

async function criarPagamento(amount, userId) {
  const preference = {
    items: [{
      title: `Doação para o Punishment`,
      unit_price: parseFloat(amount),
      quantity: 1,
    }],
    metadata: {
      discord_user: userId,
    },
    back_urls: {
      success: 'https://funczero.xyz/success',
      failure: 'https://funczero.xyz/failure',
      pending: 'https://funczero.xyz/pending',
    },
    auto_return: 'approved',
  };

  const result = await mercadopago.preferences.create(preference);
  return result.body.init_point;
}

module.exports = {
  criarPagamento,
};
