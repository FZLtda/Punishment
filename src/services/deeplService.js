'use strict';

const axios = require('axios');
const { DEEPL_API_KEY } = process.env;

/**
 * Traduz um texto usando a API do DeepL.
 * @param {string} text - Texto a ser traduzido.
 * @param {string} targetLang - Idioma de destino (ex: 'EN', 'PT-BR').
 * @returns {Promise<string>} Texto traduzido.
 */
async function translateText(text, targetLang = 'PT-BR') {
  if (!DEEPL_API_KEY) {
    throw new Error('[DeepL] Chave da API ausente no ambiente.');
  }

  if (!text || typeof text !== 'string') {
    throw new TypeError('[DeepL] Texto inválido fornecido para tradução.');
  }

  const params = new URLSearchParams({
    auth_key: DEEPL_API_KEY,
    text,
    target_lang: targetLang.toUpperCase()
  });

  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    timeout: 8000
  };

  try {
    const { data } = await axios.post('https://api-free.deepl.com/v2/translate', params, config);

    const translatedText = data?.translations?.[0]?.text;

    if (!translatedText) {
      console.warn('[DeepL] Nenhuma tradução retornada para o texto:', text);
      return 'Não foi possível traduzir a mensagem.';
    }

    return translatedText;
  } catch (error) {
    const errMsg = error.response?.data?.message || error.message;
    console.error('[DeepL] Falha ao traduzir:', errMsg);
    return 'Não foi possível conectar com a API do DeepL.';
  }
}

module.exports = { translateText };
