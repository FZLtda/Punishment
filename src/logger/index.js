'use strict';

const winston = require('winston');
const chalk = require('chalk');

// Define os níveis personalizados
const levels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  success: 4,
  debug: 5
};

// Mapeia cores para os níveis
const levelColors = {
  fatal: chalk.bgRed.white.bold,
  error: chalk.red.bold,
  warn: chalk.yellow.bold,
  info: chalk.cyan.bold,
  success: chalk.green.bold,
  debug: chalk.magenta.bold
};

// Função que retorna o timestamp formatado com fuso horário de São Paulo (UTC-3)
const getFormattedTimestamp = () => {
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

// Formato customizado para exibição dos logs
const customFormat = winston.format.printf(({ level, message }) => {
  const color = levelColors[level] || chalk.white;
  const timestamp = chalk.gray(`[${getFormattedTimestamp()}]`);
  const levelStr = color(level.toUpperCase().padEnd(7));
  return `${timestamp} ${levelStr} ▶ ${message}`;
});

// Criação do logger com configurações avançadas
const logger = winston.createLogger({
  levels,
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.splat(),
    winston.format.simple(),
    customFormat
  ),
  transports: [new winston.transports.Console()]
});

// Atalhos elegantes para cada nível
for (const level of Object.keys(levels)) {
  logger[level] = (msg) => logger.log({ level, message: msg });
}

module.exports = logger;
