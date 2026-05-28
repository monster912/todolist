'use strict';

require('dotenv').config();
const request = require('supertest');
const app = require('../src/app');
const { query } = require('../src/db/pool');

const ts = Date.now();
const baseEmail = `user_api_${ts}@example.com`;
const password = 'Test1234!';
let userId, token;

beforeAll(async () => {
  await request(app).post('/api/v1/auth/register').send({ email: baseEmail, password, name: '설정테스터' });
  const res = await request(app).post('/api/v1/auth/login').send({ email: baseEmail, password });
  userId = res.body.data.user.id;
  token = res.body.data.token;
});

afterAll(async () => {
  if (userId) await query('DELETE FROM "user" WHERE id = $1', [userId]);
});

// ─── PATCH /api/v1/users/me/settings (BE-08) ─────────────────────────────────
describe('PATCH /api/v1/users/me/settings', () => {
  it('theme 변경 → 200 + 업데이트된 user', async () => {
    const res = await request(app)
      .patch('/api/v1/users/me/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ theme: 'dark' });

    expect(res.status).toBe(200);
    expect(res.body.data.theme).toBe('dark');
    expect(res.body.data.password).toBeUndefined();
  });

  it('locale 변경 → 200', async () => {
    const res = await request(app)
      .patch('/api/v1/users/me/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ locale: 'en' });

    expect(res.status).toBe(200);
    expect(res.body.data.locale).toBe('en');
  });

  it('theme + locale 동시 변경 → 200', async () => {
    const res = await request(app)
      .patch('/api/v1/users/me/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ theme: 'light', locale: 'ko' });

    expect(res.status).toBe(200);
    expect(res.body.data.theme).toBe('light');
    expect(res.body.data.locale).toBe('ko');
  });

  it('빈 body → 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .patch('/api/v1/users/me/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('잘못된 theme 값 → 400', async () => {
    const res = await request(app)
      .patch('/api/v1/users/me/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ theme: 'blue' });
    expect(res.status).toBe(400);
  });

  it('잘못된 locale 값 → 400', async () => {
    const res = await request(app)
      .patch('/api/v1/users/me/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ locale: 'jp' });
    expect(res.status).toBe(400);
  });

  it('토큰 없음 → 401', async () => {
    const res = await request(app).patch('/api/v1/users/me/settings').send({ theme: 'dark' });
    expect(res.status).toBe(401);
  });
});

// ─── PUT /api/v1/auth/me (BE-09) ──────────────────────────────────────────────
describe('PUT /api/v1/auth/me', () => {
  it('이름 변경 → 200 (current_password 불요)', async () => {
    const res = await request(app)
      .put('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '변경된이름' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('변경된이름');
  });

  it('비밀번호 변경 시 current_password 불일치 → 401 INVALID_CREDENTIALS', async () => {
    const res = await request(app)
      .put('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ current_password: 'WrongPass1!', new_password: 'NewPass9999' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('변경 정보 없음 → 400', async () => {
    const res = await request(app)
      .put('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it('비밀번호 변경 → 200 (새 비밀번호로 로그인 가능)', async () => {
    const newPw = 'NewPass5678!';
    const res = await request(app)
      .put('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ current_password: password, new_password: newPw });
    expect(res.status).toBe(200);

    // 새 비밀번호로 로그인
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: baseEmail, password: newPw });
    expect(loginRes.status).toBe(200);
    token = loginRes.body.data.token; // 토큰 갱신
  });
});

// ─── DELETE /api/v1/auth/me (BE-09) ───────────────────────────────────────────
describe('DELETE /api/v1/auth/me', () => {
  let delEmail, delToken, delId;

  beforeAll(async () => {
    delEmail = `del_${ts}@example.com`;
    await request(app).post('/api/v1/auth/register').send({ email: delEmail, password, name: '탈퇴테스터' });
    const res = await request(app).post('/api/v1/auth/login').send({ email: delEmail, password });
    delId = res.body.data.user.id;
    delToken = res.body.data.token;
  });

  afterAll(async () => {
    if (delId) await query('DELETE FROM "user" WHERE id = $1', [delId]).catch(() => {});
  });

  it('비밀번호 없음 → 400', async () => {
    const res = await request(app)
      .delete('/api/v1/auth/me')
      .set('Authorization', `Bearer ${delToken}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it('비밀번호 불일치 → 401 INVALID_CREDENTIALS', async () => {
    const res = await request(app)
      .delete('/api/v1/auth/me')
      .set('Authorization', `Bearer ${delToken}`)
      .send({ password: 'WrongPass1!' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('정상 탈퇴 → 204', async () => {
    const res = await request(app)
      .delete('/api/v1/auth/me')
      .set('Authorization', `Bearer ${delToken}`)
      .send({ password });
    expect(res.status).toBe(204);
    delId = null;
  });

  it('탈퇴 후 로그인 불가 → 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: delEmail, password });
    expect(res.status).toBe(401);
  });
});
