'use strict';

const axios = require('axios');

const { DEEPL_API_KEY, DEEPL_API_URL } = process.env;

/**
 * Traduz um texto usando a API do DeepL (padrão 2025+).
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

  const apiUrl = DEEPL_API_URL;

  const params = new URLSearchParams({
    text,
    target_lang: targetLang.toUpperCase()
  });

  try {
    const { data } = await axios.post(
      apiUrl,
      params.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`
        },
        timeout: 8000
      }
    );

    const translatedText = data?.translations?.[0]?.text;

    if (!translatedText) {
      console.warn('[DeepL] Nenhuma tradução retornada:', text);
      return 'Não foi possível traduzir a mensagem.';
    }

    return translatedText;
  } catch (error) {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    console.error('[DeepL] Erro na tradução:', {
      status,
      message
    });

    return 'Não foi possível conectar com a API do DeepL.';
  }
}

module.exports = { translateText };
