"use strict";

/**
 * Central export file for all services.
 * Keeps imports clean and makes the services layer scalable.
 */

const ChannelLockService = require("./ChannelLockService");
const ChannelUserLockService = require("./ChannelUserLockService");
const ChannelUserUnlockService = require("./ChannelUserUnlockService");
const ModerationService = require("./ModerationService");
const apiClient = require("./apiClient");
const deeplService = require("./deeplService");
const mercadoPago = require("./mercadoPago");

module.exports = {
  ...ChannelLockService,
  ...ChannelUserLockService,
  ...ChannelUserUnlockService,
  ...ModerationService,
  ...apiClient,
  ...deeplService,
  ...mercadoPago,
};

