'use strict';

const logger = require('../utils/logger');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  if (process.env.NODE_ENV !== 'production') {
    logger.error(err.stack || err.message);
  } else {
    logger.error('[%s] %s', err.code || 'INTERNAL_ERROR', err.message);
  }

  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message },
    });
  }

  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' },
  });
}

module.exports = errorHandler;
