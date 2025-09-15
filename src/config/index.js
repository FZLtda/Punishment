'use strict';

const langFlags = require('./langFlags');
const channels  = require('./channels');
const actions   = require('./actions');
const colors    = require('./colors');
const emojis    = require('./emojis');
const roles     = require('./roles');
const bot       = require('./bot');

module.exports = {
  env: process.env.NODE_ENV,
  langFlags,
  channels,
  actions,
  colors,
  emojis,
  roles,
  bot
};
