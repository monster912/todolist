'use strict';

const categoryQueries = require('../db/categoryQueries');
const { createError } = require('../utils/errorUtils');
const { sendSuccess } = require('../utils/responseUtils');

async function getAll(req, res, next) {
  try {
    const categories = await categoryQueries.findAllByUserId(req.user.userId);
    return sendSuccess(res, categories);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  const { name } = req.body;
  try {
    const category = await categoryQueries.insertCategory(req.user.userId, name.trim());
    return sendSuccess(res, category, 201);
  } catch (err) {
    if (err.code === '23505') {
      return next(createError('DUPLICATE_CATEGORY', '이미 사용 중인 카테고리 이름입니다.', 409));
    }
    next(err);
  }
}

async function update(req, res, next) {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const existing = await categoryQueries.findByIdAndUserId(id, req.user.userId);
    if (!existing) {
      return next(createError('FORBIDDEN', '카테고리를 수정할 권한이 없습니다.', 403));
    }
    if (existing.is_default) {
      return next(createError('VALIDATION_ERROR', '기본 카테고리는 수정할 수 없습니다.', 400));
    }
    const updated = await categoryQueries.updateCategory(id, name.trim());
    return sendSuccess(res, updated);
  } catch (err) {
    if (err.code === '23505') {
      return next(createError('DUPLICATE_CATEGORY', '이미 사용 중인 카테고리 이름입니다.', 409));
    }
    next(err);
  }
}

async function remove(req, res, next) {
  const { id } = req.params;
  try {
    const existing = await categoryQueries.findByIdAndUserId(id, req.user.userId);
    if (!existing) {
      return next(createError('FORBIDDEN', '카테고리를 삭제할 권한이 없습니다.', 403));
    }
    if (existing.is_default) {
      return next(createError('VALIDATION_ERROR', '기본 카테고리는 삭제할 수 없습니다.', 400));
    }
    await categoryQueries.reassignTodosToDefault(req.user.userId, id);
    return res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, create, update, remove };
