"use strict";

/**
 * Central export file for all permission and guard utilities.
 * Keeps imports clean and makes the guards layer scalable.
 */

const channelGuards = require("./channelGuards");
const checkBotPermissions = require("./checkBotPermissions");
const checkUserPermissions = require("./checkUserPermissions");
const memberGuards = require("./memberGuards");

module.exports = {
  ...channelGuards,
  ...memberGuards,

  checkBotPermissions,
  checkUserPermissions,
};
