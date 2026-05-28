'use strict';

require('dotenv').config();
const { createError } = require('../src/utils/errorUtils');
const { sendSuccess, sendError } = require('../src/utils/responseUtils');
const { signToken, verifyToken } = require('../src/utils/jwtUtils');
const { computeTodoStatus } = require('../src/utils/statusUtils');

// ─── errorUtils ──────────────────────────────────────────────────────────────
describe('errorUtils', () => {
  it('code, statusCode, message가 설정된 Error를 반환한다', () => {
    const err = createError('VALIDATION_ERROR', '잘못된 입력', 400);
    expect(err).toBeInstanceOf(Error);
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('잘못된 입력');
  });

  it('다양한 statusCode를 지원한다', () => {
    expect(createError('NOT_FOUND', '없음', 404).statusCode).toBe(404);
    expect(createError('UNAUTHORIZED', '인증', 401).statusCode).toBe(401);
    expect(createError('FORBIDDEN', '권한', 403).statusCode).toBe(403);
  });
});

// ─── responseUtils ────────────────────────────────────────────────────────────
describe('responseUtils', () => {
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  describe('sendSuccess', () => {
    it('단건 객체는 { data: {...} } 형태로 응답한다', () => {
      const res = mockRes();
      sendSuccess(res, { id: 1, name: 'test' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: { id: 1, name: 'test' } });
    });

    it('배열은 { data: [...], total: N } 형태로 응답한다', () => {
      const res = mockRes();
      sendSuccess(res, [{ id: 1 }, { id: 2 }]);
      expect(res.json).toHaveBeenCalledWith({ data: [{ id: 1 }, { id: 2 }], total: 2 });
    });

    it('{ rows, total } 객체를 받으면 { data: rows, total } 형태로 응답한다', () => {
      const res = mockRes();
      sendSuccess(res, { rows: [{ id: 1 }], total: 10 });
      expect(res.json).toHaveBeenCalledWith({ data: [{ id: 1 }], total: 10 });
    });

    it('커스텀 statusCode를 지원한다', () => {
      const res = mockRes();
      sendSuccess(res, { id: 1 }, 201);
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('sendError', () => {
    it('statusCode와 code가 있는 에러를 올바르게 응답한다', () => {
      const res = mockRes();
      const err = createError('VALIDATION_ERROR', '잘못된 입력', 400);
      sendError(res, err);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: { code: 'VALIDATION_ERROR', message: '잘못된 입력' },
      });
    });

    it('statusCode 없는 에러는 500으로 응답한다', () => {
      const res = mockRes();
      sendError(res, new Error('알 수 없는 에러'));
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: { code: 'INTERNAL_ERROR', message: '알 수 없는 에러' },
      });
    });
  });
});

// ─── jwtUtils ─────────────────────────────────────────────────────────────────
describe('jwtUtils', () => {
  const payload = { userId: 'uuid-1234', email: 'test@example.com' };

  it('signToken이 문자열 토큰을 반환한다', () => {
    const token = signToken(payload);
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
  });

  it('verifyToken이 원래 payload를 복원한다', () => {
    const token = signToken(payload);
    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
  });

  it('잘못된 토큰은 에러를 throw한다', () => {
    expect(() => verifyToken('invalid.token.here')).toThrow();
  });

  it('변조된 토큰은 에러를 throw한다', () => {
    const token = signToken(payload);
    expect(() => verifyToken(token + 'tampered')).toThrow();
  });
});

// ─── statusUtils ──────────────────────────────────────────────────────────────
describe('statusUtils · computeTodoStatus', () => {
  const base = { is_done: false, start_date: null, end_date: null };

  it('시나리오 1: 날짜 없음 → NOT_STARTED (BR-06)', () => {
    const result = computeTodoStatus(base, new Date('2025-06-01'));
    expect(result).toBe('NOT_STARTED');
  });

  it('시나리오 2: start_date만 없음 → NOT_STARTED (BR-06)', () => {
    const todo = { ...base, end_date: '2025-06-10' };
    expect(computeTodoStatus(todo, new Date('2025-06-05'))).toBe('NOT_STARTED');
  });

  it('시나리오 3: 시작 전 → NOT_STARTED', () => {
    const todo = { ...base, start_date: '2025-06-10', end_date: '2025-06-20' };
    expect(computeTodoStatus(todo, new Date('2025-06-01'))).toBe('NOT_STARTED');
  });

  it('시나리오 4: 진행 중 → IN_PROGRESS', () => {
    const todo = { ...base, start_date: '2025-06-01', end_date: '2025-06-30' };
    expect(computeTodoStatus(todo, new Date('2025-06-15'))).toBe('IN_PROGRESS');
  });

  it('시나리오 4-경계: today = start_date → IN_PROGRESS', () => {
    const todo = { ...base, start_date: '2025-06-15', end_date: '2025-06-20' };
    expect(computeTodoStatus(todo, new Date('2025-06-15'))).toBe('IN_PROGRESS');
  });

  it('시나리오 4-경계: today = end_date → IN_PROGRESS', () => {
    const todo = { ...base, start_date: '2025-06-10', end_date: '2025-06-15' };
    expect(computeTodoStatus(todo, new Date('2025-06-15'))).toBe('IN_PROGRESS');
  });

  it('시나리오 5: 기간 초과 → OVERDUE', () => {
    const todo = { ...base, start_date: '2025-05-01', end_date: '2025-05-31' };
    expect(computeTodoStatus(todo, new Date('2025-06-01'))).toBe('OVERDUE');
  });

  it('시나리오 6: 완료 처리 → DONE (날짜 무관)', () => {
    const todo = { is_done: true, start_date: '2025-05-01', end_date: '2025-05-31' };
    expect(computeTodoStatus(todo, new Date('2025-06-01'))).toBe('DONE');
  });

  it('is_done=true이면 날짜 없어도 DONE', () => {
    const todo = { is_done: true, start_date: null, end_date: null };
    expect(computeTodoStatus(todo, new Date())).toBe('DONE');
  });
});
