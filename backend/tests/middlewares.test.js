'use strict';

require('dotenv').config();
const request = require('supertest');
const express = require('express');
const { signToken } = require('../src/utils/jwtUtils');
const authenticate = require('../src/middlewares/authenticate');
const { validateRegister, validateLogin } = require('../src/middlewares/validateAuth');
const { validateCreateTodo, validateUpdateTodo } = require('../src/middlewares/validateTodo');
const validateCategory = require('../src/middlewares/validateCategory');
const errorHandler = require('../src/middlewares/errorHandler');

function buildApp(...middlewares) {
  const app = express();
  app.use(express.json());
  app.post('/test', ...middlewares, (_req, res) => res.json({ ok: true }));
  app.get('/test', ...middlewares, (_req, res) => res.json({ ok: true }));
  app.use(errorHandler);
  return app;
}

// ─── authenticate ─────────────────────────────────────────────────────────────
describe('authenticate 미들웨어', () => {
  it('유효한 토큰 → req.user 주입 후 next()', async () => {
    const token = signToken({ userId: 'uuid-001', email: 'a@b.com' });
    const app = express();
    app.use(express.json());
    app.get('/test', authenticate, (req, res) => res.json(req.user));
    app.use(errorHandler);

    const res = await request(app)
      .get('/test')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.userId).toBe('uuid-001');
    expect(res.body.email).toBe('a@b.com');
  });

  it('토큰 없음 → 401 UNAUTHORIZED', async () => {
    const app = buildApp(authenticate);
    const res = await request(app).get('/test');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('Bearer 없는 헤더 → 401', async () => {
    const app = buildApp(authenticate);
    const res = await request(app).get('/test').set('Authorization', 'Basic abc');
    expect(res.status).toBe(401);
  });

  it('만료/변조된 토큰 → 401', async () => {
    const app = buildApp(authenticate);
    const res = await request(app).get('/test').set('Authorization', 'Bearer invalid.token.here');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});

// ─── validateRegister ─────────────────────────────────────────────────────────
describe('validateRegister 미들웨어', () => {
  const app = buildApp(validateRegister);
  const valid = { email: 'user@example.com', password: 'Pass1234', name: '홍길동' };

  it('유효한 데이터 → 통과', async () => {
    const res = await request(app).post('/test').send(valid);
    expect(res.status).toBe(200);
  });

  it('이메일 형식 오류 → 400 VALIDATION_ERROR', async () => {
    const res = await request(app).post('/test').send({ ...valid, email: 'notanemail' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('비밀번호 8자 미만 → 400', async () => {
    const res = await request(app).post('/test').send({ ...valid, password: 'Ab1' });
    expect(res.status).toBe(400);
  });

  it('비밀번호 숫자 없음 → 400', async () => {
    const res = await request(app).post('/test').send({ ...valid, password: 'Password' });
    expect(res.status).toBe(400);
  });

  it('비밀번호 영문 없음 → 400', async () => {
    const res = await request(app).post('/test').send({ ...valid, password: '12345678' });
    expect(res.status).toBe(400);
  });

  it('이름 빈 문자열 → 400', async () => {
    const res = await request(app).post('/test').send({ ...valid, name: '' });
    expect(res.status).toBe(400);
  });

  it('이름 51자 → 400', async () => {
    const res = await request(app).post('/test').send({ ...valid, name: 'a'.repeat(51) });
    expect(res.status).toBe(400);
  });
});

// ─── validateLogin ────────────────────────────────────────────────────────────
describe('validateLogin 미들웨어', () => {
  const app = buildApp(validateLogin);

  it('유효한 email/password → 통과', async () => {
    const res = await request(app).post('/test').send({ email: 'user@example.com', password: 'any' });
    expect(res.status).toBe(200);
  });

  it('이메일 없음 → 400', async () => {
    const res = await request(app).post('/test').send({ password: 'any' });
    expect(res.status).toBe(400);
  });

  it('비밀번호 없음 → 400', async () => {
    const res = await request(app).post('/test').send({ email: 'user@example.com' });
    expect(res.status).toBe(400);
  });
});

// ─── validateCreateTodo ───────────────────────────────────────────────────────
describe('validateCreateTodo 미들웨어', () => {
  const app = buildApp(validateCreateTodo);
  const valid = { title: '할일 제목', start_date: '2025-06-01', end_date: '2025-06-30' };

  it('유효한 데이터 → 통과', async () => {
    const res = await request(app).post('/test').send(valid);
    expect(res.status).toBe(200);
  });

  it('날짜 없어도 통과 (선택 필드)', async () => {
    const res = await request(app).post('/test').send({ title: '제목만' });
    expect(res.status).toBe(200);
  });

  it('title 없음 → 400', async () => {
    const res = await request(app).post('/test').send({ ...valid, title: '' });
    expect(res.status).toBe(400);
  });

  it('title 201자 → 400', async () => {
    const res = await request(app).post('/test').send({ ...valid, title: 'a'.repeat(201) });
    expect(res.status).toBe(400);
  });

  it('잘못된 날짜 형식 → 400', async () => {
    const res = await request(app).post('/test').send({ ...valid, start_date: '2025/06/01' });
    expect(res.status).toBe(400);
  });

  it('end_date < start_date → 400', async () => {
    const res = await request(app).post('/test').send({ ...valid, start_date: '2025-06-30', end_date: '2025-06-01' });
    expect(res.status).toBe(400);
  });

  it('end_date = start_date → 통과', async () => {
    const res = await request(app).post('/test').send({ title: '제목', start_date: '2025-06-15', end_date: '2025-06-15' });
    expect(res.status).toBe(200);
  });
});

// ─── validateUpdateTodo ───────────────────────────────────────────────────────
describe('validateUpdateTodo 미들웨어', () => {
  const app = buildApp(validateUpdateTodo);

  it('title 없어도 통과 (부분 업데이트)', async () => {
    const res = await request(app).post('/test').send({ start_date: '2025-06-01' });
    expect(res.status).toBe(200);
  });

  it('title 존재 시 길이 검증', async () => {
    const res = await request(app).post('/test').send({ title: 'a'.repeat(201) });
    expect(res.status).toBe(400);
  });
});

// ─── validateCategory ─────────────────────────────────────────────────────────
describe('validateCategory 미들웨어', () => {
  const app = buildApp(validateCategory);

  it('유효한 name → 통과', async () => {
    const res = await request(app).post('/test').send({ name: '업무' });
    expect(res.status).toBe(200);
  });

  it('name 없음 → 400', async () => {
    const res = await request(app).post('/test').send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('공백만 있는 name → 400', async () => {
    const res = await request(app).post('/test').send({ name: '   ' });
    expect(res.status).toBe(400);
  });

  it('51자 name → 400', async () => {
    const res = await request(app).post('/test').send({ name: 'a'.repeat(51) });
    expect(res.status).toBe(400);
  });

  it('50자 name → 통과', async () => {
    const res = await request(app).post('/test').send({ name: 'a'.repeat(50) });
    expect(res.status).toBe(200);
  });
});
