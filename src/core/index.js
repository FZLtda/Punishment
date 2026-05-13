"use strict";

const bootstrap = require("./bootstrap");
const client = require("./client");
const Monitor = require("./monitor");
const presence = require("./presence");

const {
  showStartupDiagnostic,
} = require("./diagnostic");

const {
  validateEnvironment,
} = require("./environment");

const {
  registerGlobalErrorHandlers,
} = require("./errors");

const {
  registerResources,
  gracefulExit,
} = require("./shutdown");

const {
  registerSignalHandlers,
} = require("./signals");

module.exports = {
  bootstrap,
  client,
  Monitor,
  presence,

  showStartupDiagnostic,

  validateEnvironment,

  registerGlobalErrorHandlers,

  registerResources,
  gracefulExit,

  registerSignalHandlers,
};
