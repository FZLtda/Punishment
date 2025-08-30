'use strict';

const path = require('path');
const moment = require('moment-timezone');
const fs = require('fs');

const logDir = path.resolve(__dirname, '../../logs');

// garante que o diretório existe
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const getTimestamp = () =>
  moment().tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm:ss');

const levels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  success: 4,
  debug: 5,
};

const colors = {
  fatal: 'bold red',
  error: 'red',
  warn: 'yellow',
  info: 'cyan',
  success: 'green',
  debug: 'gray',
};

module.exports = {
  logDir,
  getTimestamp,
  levels,
  colors,
};
