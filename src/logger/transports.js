'use strict';

const path = require('path');
const winston = require('winston');
const { logDir, getTimestamp } = require('@logger/config');

const formatter = winston.format.printf(({ level, message, timestamp, stack }) => {
  return `[${timestamp}] [${level.toUpperCase()}]: ${stack || message}`;
});

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: getTimestamp }),
  ...(process.env.NODE_ENV === 'production' ? [] : [winston.format.colorize({ all: true })]),
  winston.format.errors({ stack: true }),
  formatter
);

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: getTimestamp }),
  winston.format.uncolorize(),
  winston.format.errors({ stack: true }),
  formatter
);

function createTransports(levels) {
  return [
    new winston.transports.Console({ format: consoleFormat }),
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      level: 'debug',
      format: fileFormat,
    }),
    ...Object.entries(levels).map(([level]) =>
      new winston.transports.File({
        filename: path.join(logDir, `${level}.log`),
        level,
        format: fileFormat,
      })
    ),
  ];
}

module.exports = { createTransports };
