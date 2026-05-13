"use strict";

const bootstrap = require("./bootstrap");
const client = require("./client");
const diagnostic = require("./diagnostic");
const Monitor = require("./monitor");
const presence = require("./presence");

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
  diagnostic,
  Monitor,
  presence,

  validateEnvironment,

  registerGlobalErrorHandlers,

  registerResources,
  gracefulExit,

  registerSignalHandlers,
};
