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

// Timestamp com timezone de São Paulo
const getTimestamp = () =>
  moment().tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm:ss');

// Cores personalizadas por nível para Console
winston.addColors({
  error: 'bold red',
  warn: 'yellow',
  info: 'cyan',
  debug: 'gray',
  success: 'green'
});

// Formato para arquivos (sem cor)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: getTimestamp }),
  winston.format.printf(({ level, message, timestamp }) => {
    return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
  })
);

// Formato colorido para console
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: getTimestamp }),
  winston.format.printf(({ level, message, timestamp }) => {
    return `[${timestamp}] [${level}]: ${message}`;
  })
);

// Criação do logger principal
const logger = winston.createLogger({
  levels: {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    success: 4,
    debug: 5
  },
  level: process.env.LOG_LEVEL || 'debug',
  transports: [
    new winston.transports.Console({
      format: consoleFormat
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'fatal.log'),
      level: 'fatal',
      format: fileFormat
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: fileFormat
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'warn.log'),
      level: 'warn',
      format: fileFormat
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'info.log'),
      level: 'info',
      format: fileFormat
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'debug.log'),
      level: 'debug',
      format: fileFormat
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      format: fileFormat
    })
  ],
  exitOnError: false
});

// Atalhos padronizados
const log = {
  debug: (msg) => logger.debug(msg),
  info: (msg) => logger.info(msg),
  warn: (msg) => logger.warn(msg),
  error: (msg) => logger.error(msg),
  success: (msg) => logger.log({ level: 'success', message: msg }),
  fatal: (msg) => {
    logger.log({ level: 'fatal', message: `[FATAL]: ${msg}` });
    process.exit(1);
  }
};

module.exports = log;
