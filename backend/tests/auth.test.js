'use strict';

require('dotenv').config();
const request = require('supertest');
const app = require('../src/app');
const { query } = require('../src/db/pool');

// 테스트용 고유 이메일 생성
const ts = Date.now();
const testEmail = `auth_test_${ts}@example.com`;
const testPassword = 'Test1234!';
const testName = '테스트유저';

let createdUserId;

afterAll(async () => {
  if (createdUserId) {
    await query('DELETE FROM "user" WHERE id = $1', [createdUserId]);
  }
});

// ─── POST /api/v1/auth/register ──────────────────────────────────────────────
describe('POST /api/v1/auth/register', () => {
  it('정상 회원가입 → 201 + { data: user } (password 미포함)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: testEmail, password: testPassword, name: testName });

    expect(res.status).toBe(201);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.email).toBe(testEmail);
    expect(res.body.data.name).toBe(testName);
    expect(res.body.data.password).toBeUndefined();
    expect(res.body.data.id).toBeDefined();

    createdUserId = res.body.data.id;
  });

  it('이메일 중복 → 409 DUPLICATE_EMAIL', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: testEmail, password: testPassword, name: testName });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('DUPLICATE_EMAIL');
  });

  it('이메일 형식 오류 → 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'invalid', password: testPassword, name: testName });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('비밀번호 규칙 미충족 → 400', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: `other_${ts}@example.com`, password: 'short', name: testName });

    expect(res.status).toBe(400);
  });

  it('이름 누락 → 400', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: `other2_${ts}@example.com`, password: testPassword, name: '' });

    expect(res.status).toBe(400);
  });
});

// ─── POST /api/v1/auth/login ─────────────────────────────────────────────────
describe('POST /api/v1/auth/login', () => {
  it('정상 로그인 → 200 + { data: { token, user } }', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testEmail, password: testPassword });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(testEmail);
    expect(res.body.data.user.theme).toBeDefined();
    expect(res.body.data.user.locale).toBeDefined();
    expect(res.body.data.user.password).toBeUndefined();
  });

  it('존재하지 않는 이메일 → 401 INVALID_CREDENTIALS', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@example.com', password: testPassword });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('비밀번호 불일치 → 401 INVALID_CREDENTIALS', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testEmail, password: 'Wrong1234!' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('이메일 형식 오류 → 400', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'notvalid', password: testPassword });

    expect(res.status).toBe(400);
  });
});

// ─── GET /api/v1/auth/me ─────────────────────────────────────────────────────
describe('GET /api/v1/auth/me', () => {
  let token;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testEmail, password: testPassword });
    token = res.body.data.token;
  });

  it('유효한 토큰 → 200 + { data: user } (password 미포함)', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(testEmail);
    expect(res.body.data.password).toBeUndefined();
  });

  it('토큰 없음 → 401', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('잘못된 토큰 → 401', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer invalid.token');
    expect(res.status).toBe(401);
  });
});
