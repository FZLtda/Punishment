"use strict";

const winston = require("winston");
const { levels, colors } = require("./config");
const { createTransports } = require("./transports");
const { applyOverrides } = require("./overrides");

winston.addColors(colors);

const baseLogger = winston.createLogger({
  levels,
  level: process.env.LOG_LEVEL || "debug",
  exitOnError: false,
  transports: createTransports(levels),
});

applyOverrides(baseLogger, levels);

module.exports = baseLogger;
