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

module.exports = {
  ...banEmbed,
  ...kickEmbed,
  ...muteEmbed,
  ...unbanEmbed,
  ...embedError,
  ...embedSuccess,
  ...embedWarning,
};
