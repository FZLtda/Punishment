'use strict';

const withoutUser = new Set([
  'clear',
  'lock',
  'backup',
  'restore',
  'send',
  'unlock'
]);

const withoutReason = new Set([
  'clear',
  'backup',
  'restore'
]);

module.exports = {
  withoutUser,
  withoutReason
};
