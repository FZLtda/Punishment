'use strict';

const winston = require('winston');
const chalk = require('chalk');

// Níveis personalizados de log
const levels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  success: 4,
  debug: 5
};

// Cores para cada nível
const levelColors = {
  fatal: chalk.bgRed.white.bold,
  error: chalk.red.bold,
  warn: chalk.yellow.bold,
  info: chalk.cyan.bold,
  success: chalk.green.bold,
  debug: chalk.magenta.bold
};

// Timestamp com fuso horário de São Paulo
const getTimestamp = () => {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date());
};

// Formato customizado com cores e timestamp
const customFormat = winston.format.printf(({ level, message }) => {
  const timestamp = chalk.gray(`[${getTimestamp()}]`);
  const color = levelColors[level] || ((txt) => txt);
  const label = color(level.toUpperCase().padEnd(7));
  return `${timestamp} ${label} ▶ ${message}`;
});

// Criação do logger
const logger = winston.createLogger({
  levels,
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    customFormat
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(customFormat)
    })
  ]
});

// Métodos diretos para cada nível
for (const level of Object.keys(levels)) {
  logger[level] = (msg) => logger.log({ level, message: msg });
}

module.exports = logger;
