'use strict';

const winston = require('winston');
const { levels, colors } = require('@logger/config');
const { createTransports } = require('@logger/transports');
const { applyOverrides } = require('@logger/overrides');

// adiciona cores customizadas
winston.addColors(colors);

const baseLogger = winston.createLogger({
  levels,
  level: process.env.LOG_LEVEL || 'debug',
  exitOnError: false,
  transports: createTransports(levels),
});

// aplica overrides (error → webhook, fatal → exit)
applyOverrides(baseLogger, levels);

module.exports = baseLogger;
