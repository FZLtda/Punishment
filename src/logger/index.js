'use strict';

const fs = require('fs');
const path = require('path');
const winston = require('winston');
const moment = require('moment-timezone');

// Detectar ambiente
const isProduction = process.env.NODE_ENV === 'production';

// Diretório de logs
const logDir = path.resolve(__dirname, '../../logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

// Timestamp São Paulo
const getTimestamp = () =>
  moment().tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm:ss');

// Níveis customizados
const levels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  success: 4,
  debug: 5
};

// Cores customizadas para o console
const colors = {
  fatal: 'bold red',
  error: 'red',
  warn: 'yellow',
  info: 'cyan',
  success: 'green',
  debug: 'gray'
};

winston.addColors(colors);

// Formatos
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

    // Logs por nível individual
    ...Object.entries(levels).map(([level]) =>
      new winston.transports.File({
        filename: path.join(logDir, `${level}.log`),
        level,
        format: fileFormat
      })
    ),

    // Log combinado
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      level: 'debug',
      format: fileFormat
    })
  ],
  exitOnError: false
});

// Interface final do logger
const log = {};

// Métodos principais: .info, .debug, .warn, .fatal etc
for (const level of Object.keys(levels)) {
  log[level] = (msg) => {
    if (typeof msg !== 'string') msg = JSON.stringify(msg, null, 2);
    logger.log({ level, message: msg });
    if (level === 'fatal') process.exit(1);
  };
}

// Box visual pro console
log.box = (title, lines = []) => {
  const width = Math.max(...lines.map(l => l.length), title.length) + 4;

  const top = `╔${'═'.repeat(width)}╗`;
  const separator = `╠${'═'.repeat(width)}╣`;
  const bottom = `╚${'═'.repeat(width)}╝`;

  const formatLine = (line) => {
    const padding = width - line.length - 2;
    return `║ ${line}${' '.repeat(padding)}║`;
  };

  const content = [
    top,
    formatLine(title),
    separator,
    ...lines.map(formatLine),
    bottom
  ].join('\n');

  console.log('\x1b[32m%s\x1b[0m', content);
};

module.exports = log;
