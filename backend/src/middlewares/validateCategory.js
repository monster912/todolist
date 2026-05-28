'use strict';

const { createError } = require('../utils/errorUtils');

function validateCategory(req, _res, next) {
  const { name } = req.body;

  if (!name || name.trim().length < 1 || name.trim().length > 50) {
    return next(createError('VALIDATION_ERROR', '카테고리 이름은 1자 이상 50자 이하여야 합니다.', 400));
  }

  next();
}

module.exports = validateCategory;
