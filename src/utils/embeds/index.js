"use strict";

/**
 * Central export file for all embed utilities.
 * Keeps imports clean and makes the embeds layer scalable.
 */

const banEmbed = require("./banEmbed");
const kickEmbed = require("./kickEmbed");
const muteEmbed = require("./muteEmbed");
const unbanEmbed = require("./unbanEmbed");
const embedError = require("./embedError");
const embedSuccess = require("./embedSuccess");
const embedWarning = require("./embedWarning");
const createLockEmbed = require("./createLockEmbed");
const createUnlockEmbed = require("./createUnlockEmbed");
const createSlowmodeEmbed = require("./createSlowmodeEmbed");
const createUserLockEmbed = require("./createUserLockEmbed");
const createUserUnlockEmbed = require("./createUserUnlockEmbed");

module.exports = {
  ...banEmbed,
  ...kickEmbed,
  ...muteEmbed,
  ...unbanEmbed,
  ...embedError,
  ...embedSuccess,
  ...embedWarning,
  ...createLockEmbed,
  ...createUnlockEmbed,
  ...createSlowmodeEmbed,
  ...createUserLockEmbed,
  ...createUserUnlockEmbed,
};
