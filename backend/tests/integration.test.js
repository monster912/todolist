'use strict';

require('dotenv').config();
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const { query } = require('../src/db/pool');

const ts = Date.now();
const user1Email = `int_u1_${ts}@example.com`;
const user2Email = `int_u2_${ts}@example.com`;
const password = 'Test1234!';

let user1Id, user2Id, user1Token, user2Token;
let user1CatId, user1TodoId;

async function registerAndLogin(email) {
  await request(app).post('/api/v1/auth/register').send({ email, password, name: '통합테스터' });
  const res = await request(app).post('/api/v1/auth/login').send({ email, password });
  return { id: res.body.data.user.id, token: res.body.data.token };
}

beforeAll(async () => {
  const u1 = await registerAndLogin(user1Email);
  const u2 = await registerAndLogin(user2Email);
  user1Id = u1.id; user1Token = u1.token;
  user2Id = u2.id; user2Token = u2.token;

  // user1 전용 카테고리 생성
  const catRes = await request(app)
    .post('/api/v1/categories')
    .set('Authorization', `Bearer ${user1Token}`)
    .send({ name: `통합테스트카테고리_${ts}` });
  user1CatId = catRes.body.data.id;

  // user1 할일 생성
  const todoRes = await request(app)
    .post('/api/v1/todos')
    .set('Authorization', `Bearer ${user1Token}`)
    .send({ title: '통합테스트 할일', category_id: user1CatId });
  user1TodoId = todoRes.body.data.id;
});

afterAll(async () => {
  if (user1Id) await query('DELETE FROM "user" WHERE id = $1', [user1Id]);
  if (user2Id) await query('DELETE FROM "user" WHERE id = $1', [user2Id]);
});

// ─── Tier 1-A: JWT 미들웨어 3케이스 ──────────────────────────────────────────
describe('Tier 1-A · JWT 미들웨어', () => {
  it('유효한 토큰 → 200 정상 접근', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${user1Token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(user1Email);
  });

  it('만료된 토큰 → 401 UNAUTHORIZED', async () => {
    // 즉시 만료되는 토큰 생성
    const expiredToken = jwt.sign(
      { userId: user1Id, email: user1Email },
      process.env.JWT_SECRET,
      { expiresIn: '1ms' }
    );
    // 1ms 후 만료 대기
    await new Promise(r => setTimeout(r, 10));

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${expiredToken}`);
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('토큰 없음 → 401 UNAUTHORIZED', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('변조된 토큰 → 401 UNAUTHORIZED', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${user1Token}tampered`);
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('Bearer 접두사 없음 → 401', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', user1Token);
    expect(res.status).toBe(401);
  });
});

// ─── Tier 1-B: 소유권 검증 (403) ─────────────────────────────────────────────
describe('Tier 1-B · 소유권 — 타인 리소스 접근 403', () => {
  it('타인 카테고리 수정 → 403 FORBIDDEN', async () => {
    const res = await request(app)
      .put(`/api/v1/categories/${user1CatId}`)
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ name: '해킹시도' });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('타인 카테고리 삭제 → 403 FORBIDDEN', async () => {
    const res = await request(app)
      .delete(`/api/v1/categories/${user1CatId}`)
      .set('Authorization', `Bearer ${user2Token}`);
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('타인 할일 단건 조회 → 403 FORBIDDEN', async () => {
    const res = await request(app)
      .get(`/api/v1/todos/${user1TodoId}`)
      .set('Authorization', `Bearer ${user2Token}`);
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('타인 할일 수정 → 403 FORBIDDEN', async () => {
    const res = await request(app)
      .put(`/api/v1/todos/${user1TodoId}`)
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ title: '해킹' });
    expect(res.status).toBe(403);
  });

  it('타인 할일 완료 처리 → 403 FORBIDDEN', async () => {
    const res = await request(app)
      .patch(`/api/v1/todos/${user1TodoId}/done`)
      .set('Authorization', `Bearer ${user2Token}`);
    expect(res.status).toBe(403);
  });

  it('타인 할일 삭제 → 403 FORBIDDEN', async () => {
    const res = await request(app)
      .delete(`/api/v1/todos/${user1TodoId}`)
      .set('Authorization', `Bearer ${user2Token}`);
    expect(res.status).toBe(403);
  });
});

// ─── Tier 1-C: 카테고리 삭제 → 할일 이관 로직 ───────────────────────────────
describe('Tier 1-C · 카테고리 삭제 → 할일 이관', () => {
  let transferCatId, transferTodoId, defaultCatId;

  beforeAll(async () => {
    // 이관 테스트용 카테고리 생성
    const catRes = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ name: `이관소스_${ts}` });
    transferCatId = catRes.body.data.id;

    // 해당 카테고리에 할일 생성
    const todoRes = await request(app)
      .post('/api/v1/todos')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ title: '이관될 할일', category_id: transferCatId });
    transferTodoId = todoRes.body.data.id;

    // 기본 카테고리 id 확인
    const listRes = await request(app)
      .get('/api/v1/categories')
      .set('Authorization', `Bearer ${user1Token}`);
    defaultCatId = listRes.body.data.find(c => c.is_default).id;
  });

  it('카테고리 삭제 → 204', async () => {
    const res = await request(app)
      .delete(`/api/v1/categories/${transferCatId}`)
      .set('Authorization', `Bearer ${user1Token}`);
    expect(res.status).toBe(204);
  });

  it('삭제된 카테고리의 할일이 기본 카테고리로 이관됨', async () => {
    const res = await request(app)
      .get(`/api/v1/todos/${transferTodoId}`)
      .set('Authorization', `Bearer ${user1Token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.category_id).toBe(defaultCatId);
  });

  it('삭제된 카테고리는 목록에서 사라짐', async () => {
    const res = await request(app)
      .get('/api/v1/categories')
      .set('Authorization', `Bearer ${user1Token}`);
    const ids = res.body.data.map(c => c.id);
    expect(ids).not.toContain(transferCatId);
  });
});

// ─── Tier 1-D: 404 핸들러 & CORS & 에러 응답 구조 ──────────────────────────
describe('Tier 1-D · 404 핸들러 / CORS / 에러 응답 구조', () => {
  it('미정의 경로 → 404 NOT_FOUND', async () => {
    const res = await request(app).get('/api/v1/unknown-path');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('에러 응답은 항상 { error: { code, message } } 구조', async () => {
    const res = await request(app).get('/api/v1/unknown-path');
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toHaveProperty('code');
    expect(res.body.error).toHaveProperty('message');
  });

  it('CORS — 허용된 Origin에 Access-Control-Allow-Origin 헤더 포함', async () => {
    const origin = process.env.CORS_ORIGIN || 'http://localhost:5173';
    const res = await request(app)
      .get('/api/v1/health')
      .set('Origin', origin);
    expect(res.headers['access-control-allow-origin']).toBe(origin);
  });

  it('CORS — 와일드카드(*) 미사용 확인', async () => {
    const res = await request(app)
      .get('/api/v1/health')
      .set('Origin', 'http://localhost:5173');
    expect(res.headers['access-control-allow-origin']).not.toBe('*');
  });

  it('500 에러 응답에 stack 필드 없음', async () => {
    const prevEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const express = require('express');
    const errorHandler = require('../src/middlewares/errorHandler');
    const testApp = express();
    testApp.get('/boom', (_req, _res, next) => next(new Error('의도적 오류')));
    testApp.use(errorHandler);

    const res = await request(testApp).get('/boom');
    expect(res.status).toBe(500);
    expect(res.body).not.toHaveProperty('stack');
    expect(res.body.error.code).toBe('INTERNAL_ERROR');

    process.env.NODE_ENV = prevEnv;
  });
});
