'use strict';

const bcrypt = require('bcrypt');
const userQueries = require('../db/userQueries');
const { signToken } = require('../utils/jwtUtils');
const { createError } = require('../utils/errorUtils');
const { sendSuccess } = require('../utils/responseUtils');
const logger = require('../utils/logger');

async function register(req, res, next) {
  const { email, password, name } = req.body;
  try {
    const existing = await userQueries.findByEmail(email);
    if (existing) {
      return next(createError('DUPLICATE_EMAIL', '이미 사용 중인 이메일입니다.', 409));
    }
    const rounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12;
    const hashed = await bcrypt.hash(password, rounds);
    const user = await userQueries.insertUser(email, hashed, name.trim());
    logger.info('신규 사용자 가입: %s', email);
    return sendSuccess(res, user, 201);
  } catch (err) {
    if (err.code === '23505') {
      return next(createError('DUPLICATE_EMAIL', '이미 사용 중인 이메일입니다.', 409));
    }
    next(err);
  }
}

async function login(req, res, next) {
  const { email, password } = req.body;
  try {
    const user = await userQueries.findByEmail(email);
    if (!user) {
      return next(createError('INVALID_CREDENTIALS', '이메일 또는 비밀번호가 올바르지 않습니다.', 401));
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return next(createError('INVALID_CREDENTIALS', '이메일 또는 비밀번호가 올바르지 않습니다.', 401));
    }
    const token = signToken({ userId: user.id, email: user.email });
    logger.info('로그인 성공: %s', email);
    return sendSuccess(res, {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        theme: user.theme,
        locale: user.locale,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res, next) {
  try {
    const user = await userQueries.findById(req.user.userId);
    if (!user) {
      return next(createError('UNAUTHORIZED', '사용자를 찾을 수 없습니다.', 401));
    }
    return sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
}

const NAME_RE = /^.{1,50}$/;
const PW_RE_LEN = 8;

async function updateMe(req, res, next) {
  const { currentPassword, name, newPassword } = req.body;
  try {
    if (!name && !newPassword) {
      return next(createError('VALIDATION_ERROR', '변경할 정보를 입력해주세요.', 400));
    }
    if (!currentPassword) {
      return next(createError('VALIDATION_ERROR', '현재 비밀번호를 입력해주세요.', 400));
    }
    const user = await userQueries.findByEmail(req.user.email);
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return next(createError('INVALID_CREDENTIALS', '현재 비밀번호가 올바르지 않습니다.', 401));
    }
    const data = {};
    if (name !== undefined) {
      const trimmed = name.trim();
      if (!NAME_RE.test(trimmed)) {
        return next(createError('VALIDATION_ERROR', '이름은 1자 이상 50자 이하여야 합니다.', 400));
      }
      data.name = trimmed;
    }
    if (newPassword !== undefined) {
      if (newPassword.length < PW_RE_LEN || !/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
        return next(createError('VALIDATION_ERROR', '비밀번호는 8자 이상, 영문과 숫자를 포함해야 합니다.', 400));
      }
      const rounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12;
      data.password = await bcrypt.hash(newPassword, rounds);
    }
    const updated = await userQueries.updateUser(req.user.userId, data);
    logger.info('사용자 정보 수정: %s', req.user.userId);
    return sendSuccess(res, updated);
  } catch (err) {
    next(err);
  }
}

async function deleteMe(req, res, next) {
  const { password } = req.body;
  try {
    if (!password) {
      return next(createError('VALIDATION_ERROR', '비밀번호를 입력해주세요.', 400));
    }
    const user = await userQueries.findByEmail(req.user.email);
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return next(createError('INVALID_CREDENTIALS', '비밀번호가 올바르지 않습니다.', 401));
    }
    await userQueries.deleteUser(req.user.userId);
    logger.info('사용자 탈퇴: %s', req.user.userId);
    return res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, getMe, updateMe, deleteMe };
