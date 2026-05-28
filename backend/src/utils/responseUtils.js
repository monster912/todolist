'use strict';

function sendSuccess(res, data, statusCode = 200) {
  if (Array.isArray(data)) {
    return res.status(statusCode).json({ data, total: data.length });
  }
  if (data && typeof data === 'object' && 'rows' in data && 'total' in data) {
    return res.status(statusCode).json({ data: data.rows, total: data.total });
  }
  return res.status(statusCode).json({ data });
}

function sendError(res, err) {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  return res.status(statusCode).json({ error: { code, message: err.message } });
}

module.exports = { sendSuccess, sendError };
