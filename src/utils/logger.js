const winston = require('winston');
const path = require('path');
const fs = require('fs');

const logDir = path.resolve(__dirname, '@logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

const levels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  http: 4,
  debug: 5,
};

const colors = {
  fatal: 'magentaBG',
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'cyan',
  debug: 'blue',
};
winston.addColors(colors);

const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'DD/MM/YYYY HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message }) => {
    return `[${timestamp}] ${level}: ${message}`;
  })
);

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message }) => {
    return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  })
);

const logger = winston.createLogger({
  levels,
  level: 'debug',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
    }),

    new winston.transports.File({
      filename: path.join(logDir, 'fatal.log'),
      level: 'fatal',
      format: fileFormat,
    }),

    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: fileFormat,
    }),

    new winston.transports.File({
      filename: path.join(logDir, 'warn.log'),
      level: 'warn',
      format: fileFormat,
    }),

    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      format: fileFormat,
    }),
  ],
  exitOnError: false,
});

logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

if (!logger.fatal) {
  logger.fatal = (message, meta = {}) => {
    logger.log({
      level: 'fatal',
      message: `[FATAL] ${message}`,
      ...meta,
    });
  };
}

module.exports = logger;
