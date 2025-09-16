'use strict';

const withoutUser = new Set([
  'lock',
  'send',
  'clear',
  'backup',
  'unlock',
  'restore',
  'slowmode'
]);

const withoutReason = new Set([
  'send',
  'clear',
  'backup',
  'restore',
  'slowmode'
]);

module.exports = {
  withoutUser,
  withoutReason
};
