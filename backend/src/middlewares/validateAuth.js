'use strict';

const { createError } = require('../utils/errorUtils');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateRegister(req, _res, next) {
  const { email, password, name } = req.body;

  if (!email || !EMAIL_RE.test(email)) {
    return next(createError('VALIDATION_ERROR', '유효한 이메일 형식이 아닙니다.', 400));
  }
  if (!password || password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return next(createError('VALIDATION_ERROR', '비밀번호는 8자 이상, 영문과 숫자를 포함해야 합니다.', 400));
  }
  if (!name || name.trim().length < 1 || name.trim().length > 50) {
    return next(createError('VALIDATION_ERROR', '이름은 1자 이상 50자 이하여야 합니다.', 400));
  }

  next();
}

function validateLogin(req, _res, next) {
  const { email, password } = req.body;

  if (!email || !EMAIL_RE.test(email)) {
    return next(createError('VALIDATION_ERROR', '유효한 이메일 형식이 아닙니다.', 400));
  }
  if (!password) {
    return next(createError('VALIDATION_ERROR', '비밀번호를 입력해주세요.', 400));
  }

  next();
}

module.exports = { validateRegister, validateLogin };
