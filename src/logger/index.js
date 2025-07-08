'use strict';

const fs = require('fs');
const path = require('path');
const winston = require('winston');
const moment = require('moment-timezone');

// Detecta se o ambiente é produção
const isProduction = process.env.NODE_ENV === 'production';

// Cria diretório de logs se não existir
const logDir = path.resolve(__dirname, '../../logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

// Timestamp no fuso de São Paulo
const getTimestamp = () =>
  moment().tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm:ss');

// Níveis personalizados
const levels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  success: 4,
  debug: 5
};

// Cores para o console
const colors = {
  fatal: 'bold red',
  error: 'red',
  warn: 'yellow',
  info: 'cyan',
  success: 'green',
  debug: 'gray'
};

winston.addColors(colors);

// Formatos base
const baseFormat = winston.format.printf(({ level, message, timestamp }) =>
  `[${timestamp}] [${level.toUpperCase()}]: ${message}`
);

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: getTimestamp }),
  baseFormat
);

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: getTimestamp }),
  ...(isProduction ? [] : [winston.format.colorize({ all: true })]),
  baseFormat
);

// Instância Winston
const logger = winston.createLogger({
  levels,
  level: process.env.LOG_LEVEL || 'debug',
  transports: [
    new winston.transports.Console({ format: consoleFormat }),
    ...Object.entries(levels).map(([level]) =>
      new winston.transports.File({
        filename: path.join(logDir, `${level}.log`),
        level,
        format: fileFormat
      })
    ),
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      level: 'debug',
      format: fileFormat
    })
  ],
  exitOnError: false
});

// Interface simplificada
const log = {};
for (const level of Object.keys(levels)) {
  log[level] = (msg) => {
    const message = typeof msg === 'string' ? msg : JSON.stringify(msg, null, 2);
    logger.log({ level, message });
    if (level === 'fatal') process.exit(1);
  };
}

// Estilização de caixa visual no console
log.box = (title, lines = []) => {
  const allLines = [title, ...lines];
  const width = Math.max(...allLines.map(line => line.length)) + 4;

  const top = `╔${'═'.repeat(width)}╗`;
  const bottom = `╚${'═'.repeat(width)}╝`;
  const formatLine = (line) => {
    const padding = width - line.length - 2;
    return `║ ${line}${' '.repeat(padding)}║`;
  };

  const content = [
    top,
    ...allLines.map(formatLine),
    bottom
  ].join('\n');

  console.log('\x1b[32m%s\x1b[0m', content);
};

module.exports = log;
