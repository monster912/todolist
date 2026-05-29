'use strict';

const { createError } = require('../utils/errorUtils');

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DATETIME_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

function isValidDate(str) {
  // ISO 8601 형식(datetime) 또는 YYYY-MM-DD 형식(date) 모두 지원
  if (DATETIME_RE.test(str) || DATE_RE.test(str)) {
    const d = new Date(str);
    return !isNaN(d.getTime());
  }
  return false;
}

function validateCreateTodo(req, _res, next) {
  const { title, start_date, end_date } = req.body;

  if (!title || title.trim().length < 1 || title.trim().length > 200) {
    return next(createError('VALIDATION_ERROR', '제목은 1자 이상 200자 이하여야 합니다.', 400));
  }
  if (start_date !== undefined && start_date !== null && !isValidDate(start_date)) {
    return next(createError('VALIDATION_ERROR', '시작 날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)', 400));
  }
  if (end_date !== undefined && end_date !== null && !isValidDate(end_date)) {
    return next(createError('VALIDATION_ERROR', '종료 날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)', 400));
  }
  if (start_date && end_date && new Date(end_date) < new Date(start_date)) {
    return next(createError('VALIDATION_ERROR', '종료 날짜는 시작 날짜보다 같거나 이후여야 합니다.', 400));
  }

  next();
}

function validateUpdateTodo(req, _res, next) {
  const { title, start_date, end_date } = req.body;

  if (title !== undefined && (title.trim().length < 1 || title.trim().length > 200)) {
    return next(createError('VALIDATION_ERROR', '제목은 1자 이상 200자 이하여야 합니다.', 400));
  }
  if (start_date !== undefined && start_date !== null && !isValidDate(start_date)) {
    return next(createError('VALIDATION_ERROR', '시작 날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)', 400));
  }
  if (end_date !== undefined && end_date !== null && !isValidDate(end_date)) {
    return next(createError('VALIDATION_ERROR', '종료 날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)', 400));
  }
  if (start_date && end_date && new Date(end_date) < new Date(start_date)) {
    return next(createError('VALIDATION_ERROR', '종료 날짜는 시작 날짜보다 같거나 이후여야 합니다.', 400));
  }

  next();
}

module.exports = { validateCreateTodo, validateUpdateTodo };
