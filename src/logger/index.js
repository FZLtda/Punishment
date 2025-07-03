'use strict';

const fs = require('fs');
const path = require('path');
const winston = require('winston');
const moment = require('moment-timezone');

// Detectar ambiente (produção = sem cor)
const isProduction = process.env.NODE_ENV === 'production';

// Diretório de logs
const logDir = path.resolve(__dirname, '../../logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

// Timestamp
const getTimestamp = () =>
  moment().tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm:ss');

// Níveis e cores
const levels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  success: 4,
  debug: 5
};

const colors = {
  fatal: 'bold red',
  error: 'red',
  warn: 'yellow',
  info: 'cyan',
  success: 'green',
  debug: 'gray'
};

winston.addColors(colors);

// Formato base
const baseFormat = winston.format.printf(({ level, message, timestamp }) =>
  `[${timestamp}] [${level.toUpperCase()}]: ${message}`
);

// Formatos
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: getTimestamp }),
  baseFormat
);

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: getTimestamp }),
  ...(isProduction ? [] : [winston.format.colorize({ all: true })]),
  baseFormat
);

// Logger principal
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

// Interface padronizada
const log = {
  debug: (msg) => logger.debug(msg),
  info: (msg) => logger.info(msg),
  warn: (msg) => logger.warn(msg),
  error: (msg) => logger.error(msg),
  success: (msg) => logger.log({ level: 'success', message: msg }),
  fatal: (msg) => {
    logger.log({ level: 'fatal', message: msg });
    process.exit(1);
  }
};

module.exports = log;
