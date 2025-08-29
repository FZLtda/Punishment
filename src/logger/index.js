'use strict';

const fs = require('fs');
const path = require('path');
const winston = require('winston');
const moment = require('moment-timezone');
const fetch = require('node-fetch');

const logDir = path.resolve(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const ERROR_WEBHOOK = process.env.ERROR_WEBHOOK;
const isProduction = process.env.NODE_ENV === 'production';

const getTimestamp = () =>
  moment().tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm:ss');

const levels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  success: 4,
  debug: 5,
};

const colors = {
  fatal: 'bold red',
  error: 'red',
  warn: 'yellow',
  info: 'cyan',
  success: 'green',
  debug: 'gray',
};

winston.addColors(colors);

const formatter = winston.format.printf(({ level, message, timestamp, stack }) => {
  return `[${timestamp}] [${level.toUpperCase()}]: ${stack || message}`;
});

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: getTimestamp }),
  ...(isProduction ? [] : [winston.format.colorize({ all: true })]),
  winston.format.errors({ stack: true }),
  formatter
);

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: getTimestamp }),
  winston.format.uncolorize(),
  winston.format.errors({ stack: true }),
  formatter
);

const baseLogger = winston.createLogger({
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
    ...Object.entries(levels).map(([level]) =>
      new winston.transports.File({
        filename: path.join(logDir, `${level}.log`),
        level,
        format: fileFormat
      })
    )
  ]
});

/**
 * Envia logs críticos para o Discord via webhook
 */
async function sendToWebhook(level, message) {
  if (!ERROR_WEBHOOK) return;

  const embed = {
    embeds: [
      {
        title: `Punishment - ${level.toUpperCase()}`,
        color: level === 'fatal' ? 0x8B0000 : 0xFF0000,
        description: `\`\`\`\n${message.slice(0, 4000)}\n\`\`\``,
        timestamp: new Date().toISOString(),
      },
    ],
  };

  try {
    await fetch(ERROR_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(embed),
    });
  } catch (err) {
    console.error('Falha ao enviar log para o Discord:', err.message);
  }
}

// Sobrescreve métodos para integrar ao webhook
for (const [level] of Object.entries(levels)) {
  baseLogger[level] = (message, error) => {
    const isError = error instanceof Error;
    const formattedMessage = isError
      ? `${message}\n${error.stack}`
      : typeof message === 'string'
      ? message
      : JSON.stringify(message, null, 2);

    baseLogger.log({ level, message: formattedMessage });

    // Se for erro crítico, manda pro webhook
    if (['error', 'fatal'].includes(level)) {
      sendToWebhook(level, formattedMessage);
    }

    if (level === 'fatal') process.exit(1);
  };
}

module.exports = baseLogger;
