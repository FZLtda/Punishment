'use strict';

const fs = require('fs');
const path = require('path');
const winston = require('winston');
const moment = require('moment-timezone');

// Diretório central de logs
const logDir = path.resolve(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Timestamp com fuso horário fixo
const getTimestamp = () =>
  moment().tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm:ss');

// Níveis personalizados (ordem de severidade)
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

// Formato para arquivos de log
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: getTimestamp }),
  winston.format.printf(({ level, message, timestamp }) =>
    `[${timestamp}] [${level.toUpperCase()}]: ${message}`
  )
);

// Formato para o console com cor e timestamp
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: getTimestamp }),
  winston.format.printf(({ level, message, timestamp }) =>
    `[${timestamp}] [${level.toUpperCase()}]: ${message}`
  )
);

// Logger principal
const logger = winston.createLogger({
  levels,
  level: process.env.LOG_LEVEL || 'debug',
  transports: [
    new winston.transports.Console({ format: consoleFormat }),

    // Logs individuais por nível
    ...Object.entries(levels).map(([level]) =>
      new winston.transports.File({
        filename: path.join(logDir, `${level}.log`),
        level,
        format: fileFormat
      })
    ),

    // Log combinado (todos os níveis)
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      level: 'debug',
      format: fileFormat
    })
  ],
  exitOnError: false
});

// Interface segura e padronizada
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
