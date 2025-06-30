const winston = require('winston');
const chalk = require('chalk');

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  success: 3
};

const customFormat = winston.format.printf(({ level, message, timestamp }) => {
  const color =
    level === 'error' ? chalk.red :
    level === 'warn' ? chalk.yellow :
    level === 'info' ? chalk.cyan :
    level === 'success' ? chalk.green :
    chalk.white;

  return `${chalk.gray(`[${timestamp}]`)} ${color(level.toUpperCase())} ▶ ${message}`;
});

const logger = winston.createLogger({
  levels,
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    customFormat
  ),
  transports: [new winston.transports.Console()]
});

logger.success = (msg) => logger.log({ level: 'success', message: msg });
logger.info = (msg) => logger.log({ level: 'info', message: msg });
logger.warn = (msg) => logger.log({ level: 'warn', message: msg });
logger.error = (msg) => logger.log({ level: 'error', message: msg });

module.exports = logger;

