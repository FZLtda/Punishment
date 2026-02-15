'use strict';

const axios = require('axios');
const Logger = require('@logger');

const API_URL = process.env.PUNISHMENT_API_URL;
const API_KEY = process.env.PUNISHMENT_API_KEY;

if (!API_URL) {
  throw new Error('PUNISHMENT_API_URL não está definida.');
}

if (!API_KEY) {
  throw new Error('PUNISHMENT_API_KEY não está definida.');
}

const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
  headers: {
    'x-api-key': API_KEY,
    'Content-Type': 'application/json'
  },
  validateStatus: (status) => status >= 200 && status < 500
});

api.interceptors.request.use((config) => {
  config.metadata = { startTime: Date.now() };
  return config;
});

api.interceptors.response.use(
  (response) => {
    const duration =
      Date.now() - (response.config.metadata?.startTime || Date.now());

    Logger.debug(
      `[API] ${response.config.method?.toUpperCase()} ${response.config.url} → ${response.status} (${duration}ms)`
    );

    return response;
  },
  (error) => {
    if (error.response) {
      Logger.error(
        `[API ERROR] ${error.config?.url} → ${error.response.status} - ${error.response.data?.message || 'Erro desconhecido'}`
      );
    } else if (error.request) {
      Logger.error(
        `[API ERROR] Sem resposta da API (${error.config?.url})`
      );
    } else {
      Logger.error(`[API ERROR] ${error.message}`);
    }

    return Promise.reject(error);
  }
);

module.exports = { api };
