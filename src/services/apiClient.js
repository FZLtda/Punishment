const axios = require('axios');

const API_URL = process.env.PUNISHMENT_API_URL;
const API_KEY = process.env.PUNISHMENT_API_KEY;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'x-api-key': API_KEY,
    'Content-Type': 'application/json'
  },
  timeout: 5000
});

module.exports = { api };
