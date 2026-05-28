'use strict';

const userQueries = require('../db/userQueries');
const { createError } = require('../utils/errorUtils');
const { sendSuccess } = require('../utils/responseUtils');
const logger = require('../utils/logger');

const VALID_THEMES = ['light', 'dark'];
const VALID_LOCALES = ['ko', 'en'];

async function updateSettings(req, res, next) {
  const { theme, locale } = req.body;
  try {
    if (!theme && !locale) {
      return next(createError('VALIDATION_ERROR', '변경할 설정 값을 입력해주세요.', 400));
    }
    if (theme && !VALID_THEMES.includes(theme)) {
      return next(createError('VALIDATION_ERROR', `테마는 ${VALID_THEMES.join(', ')} 중 하나여야 합니다.`, 400));
    }
    if (locale && !VALID_LOCALES.includes(locale)) {
      return next(createError('VALIDATION_ERROR', `언어는 ${VALID_LOCALES.join(', ')} 중 하나여야 합니다.`, 400));
    }
    const updated = await userQueries.updateSettings(req.user.userId, { theme, locale });
    if (!updated) {
      return next(createError('NOT_FOUND', '사용자를 찾을 수 없습니다.', 404));
    }
    logger.info('사용자 설정 변경: %s', req.user.userId);
    return sendSuccess(res, updated);
  } catch (err) {
    next(err);
  }
}

module.exports = { updateSettings };
