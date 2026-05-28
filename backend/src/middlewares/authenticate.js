'use strict';

const { verifyToken } = require('../utils/jwtUtils');
const { createError } = require('../utils/errorUtils');

function authenticate(req, _res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(createError('UNAUTHORIZED', '인증 토큰이 없거나 만료되었습니다.', 401));
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return next(createError('UNAUTHORIZED', '인증 토큰이 없거나 만료되었습니다.', 401));
  }

  try {
    const decoded = verifyToken(token);
    req.user = { userId: decoded.userId, email: decoded.email };
    next();
  } catch (_err) {
    next(createError('UNAUTHORIZED', '인증 토큰이 없거나 만료되었습니다.', 401));
  }
}

module.exports = authenticate;
