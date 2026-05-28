'use strict';

function info(message, ...args) {
  console.warn(`[INFO] ${message}`, ...args);
}

function error(message, ...args) {
  console.error(`[ERROR] ${message}`, ...args);
}

function warn(message, ...args) {
  console.warn(`[WARN] ${message}`, ...args);
}

module.exports = { info, error, warn };
