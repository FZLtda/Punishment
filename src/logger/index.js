'use strict';

const winston = require('winston');
const chalk = require('chalk');

const levels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  success: 4,
  debug: 5
};

const colors = {
  fatal: chalk.bgRed.white.bold,
  error: chalk.red.bold,
  warn: chalk.yellow.bold,
  info: chalk.cyan.bold,
  success: chalk.green.bold,
  debug: chalk.magenta.bold
};

// Timestamp com fuso horário São Paulo
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

// Formato customizado com chalk direto (não usa simple(), nem colorize())
const customFormat = winston.format.printf(({ level, message }) => {
  const timestamp = chalk.gray(`[${getTimestamp()}]`);
  const coloredLevel = colors[level] ? colors[level](level.toUpperCase().padEnd(7)) : level.toUpperCase();
  return `${timestamp} ${coloredLevel} ▶ ${message}`;
});

// Criação do logger
const logger = winston.createLogger({
  levels,
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    customFormat
  ),
  transports: [new winston.transports.Console()]
});

// Atalhos diretos
for (const level of Object.keys(levels)) {
  logger[level] = (msg) => logger.log({ level, message: msg });
}

module.exports = logger;
