'use strict';

const fs = require('fs');
const path = require('path');
const winston = require('winston');
const moment = require('moment-timezone');

// Diretório de logs
const logDir = path.resolve(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Ambiente
const isProduction = process.env.NODE_ENV === 'production';

// Timezone de São Paulo
const getTimestamp = () => moment().tz('America/Sao_Paulo').format('YYYY-MM-DD HH:mm:ss');

// Níveis customizados
const levels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  success: 4,
  debug: 5
};

// Cores no console
const colors = {
  fatal: 'bold red',
  error: 'red',
  warn: 'yellow',
  info: 'cyan',
  success: 'green',
  debug: 'gray'
};

winston.addColors(colors);

// Formato padronizado
const formatter = winston.format.printf(({ level, message, timestamp }) => {
  return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
});

// Formatos para console e arquivos
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: getTimestamp }),
  !isProduction && winston.format.colorize({ all: true }),
  formatter
);

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: getTimestamp }),
  winston.format.uncolorize(),
  formatter
);

// Logger principal
const logger = winston.createLogger({
  levels,
  level: process.env.LOG_LEVEL || 'debug',
  exitOnError: false,
  transports: [
    new winston.transports.Console({ format: consoleFormat }),
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      level: 'debug',
      format: fileFormat
    }),
    ...Object.keys(levels).map((level) =>
      new winston.transports.File({
        filename: path.join(logDir, `${level}.log`),
        level,
        format: fileFormat
      })
    )
  ]
});

// Interface simplificada
const log = {};
for (const level of Object.keys(levels)) {
  log[level] = (input) => {
    const message = typeof input === 'string' ? input : JSON.stringify(input, null, 2);
    logger.log({ level, message });

    if (level === 'fatal') {
      process.exit(1);
    }
  };
}

module.exports = log;
