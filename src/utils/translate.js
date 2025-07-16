'use strict';

const axios = require('axios');
const { DEEPL_API_KEY } = process.env;

/**
 * Traduz texto usando a API do DeepL.
 * @param {string} text - Texto a ser traduzido.
 * @param {string} targetLang - Idioma de destino (ex: 'EN', 'PT-BR').
 * @returns {Promise<string>} - Texto traduzido.
 */
async function translateText(text, targetLang = 'PT-BR') {
  if (!DEEPL_API_KEY) throw new Error('[DeepL] Chave da API ausente.');

  try {
    const response = await axios.post(
      'https://api-free.deepl.com/v2/translate',
      new URLSearchParams({
        auth_key: DEEPL_API_KEY,
        text,
        target_lang: targetLang.toUpperCase()
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    const translated = response.data?.translations?.[0]?.text;
    return translated || 'Erro ao obter tradução.';
  } catch (error) {
    console.error('[DeepL]', error.response?.data || error.message);
    return 'Erro ao conectar com a API do DeepL.';
  }
}

module.exports = { translateText };
