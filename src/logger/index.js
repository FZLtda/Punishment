const winston = require('winston');
const chalk = require('chalk');

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
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    customFormat
  ),
  transports: [
    new winston.transports.Console()
    // Futuro: Adicionar winston.transports.File para persistência de logs
  ]
});

// Níveis customizados
logger.success = (msg) => logger.log({ level: 'success', message: msg });
logger.info = (msg) => logger.log({ level: 'info', message: msg });
logger.warn = (msg) => logger.log({ level: 'warn', message: msg });
logger.error = (msg) => logger.log({ level: 'error', message: msg });

module.exports = logger;
