'use strict';

require('dotenv').config();
const request = require('supertest');
const app = require('../src/app');
const { query } = require('../src/db/pool');

const ts = Date.now();
const user1Email = `cat_user1_${ts}@example.com`;
const user2Email = `cat_user2_${ts}@example.com`;
const password = 'Test1234!';

let user1Id, user2Id, user1Token, user2Token;

async function registerAndLogin(email) {
  await request(app).post('/api/v1/auth/register').send({ email, password, name: '테스터' });
  const res = await request(app).post('/api/v1/auth/login').send({ email, password });
  return { id: res.body.data.user.id, token: res.body.data.token };
}

beforeAll(async () => {
  const u1 = await registerAndLogin(user1Email);
  const u2 = await registerAndLogin(user2Email);
  user1Id = u1.id;
  user2Id = u2.id;
  user1Token = u1.token;
  user2Token = u2.token;
});

afterAll(async () => {
  if (user1Id) await query('DELETE FROM "user" WHERE id = $1', [user1Id]);
  if (user2Id) await query('DELETE FROM "user" WHERE id = $1', [user2Id]);
});

// ─── GET /api/v1/categories ───────────────────────────────────────────────────
describe('GET /api/v1/categories', () => {
  it('인증된 사용자 → 기본 카테고리 포함 목록 반환', async () => {
    const res = await request(app)
      .get('/api/v1/categories')
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.total).toBeGreaterThanOrEqual(1);
    const defaultCat = res.body.data.find(c => c.is_default === true);
    expect(defaultCat).toBeDefined();
    expect(defaultCat.name).toBe('기본');
  });

  it('토큰 없음 → 401', async () => {
    const res = await request(app).get('/api/v1/categories');
    expect(res.status).toBe(401);
  });
});

// ─── POST /api/v1/categories ──────────────────────────────────────────────────
describe('POST /api/v1/categories', () => {
  it('정상 생성 → 201 + { data: category }', async () => {
    const res = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ name: '업무' });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('업무');
    expect(res.body.data.is_default).toBe(false);
    expect(res.body.data.user_id).toBe(user1Id);
  });

  it('name 중복 → 409 DUPLICATE_CATEGORY', async () => {
    const res = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ name: '업무' });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('DUPLICATE_CATEGORY');
  });

  it('name 빈 값 → 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ name: '' });

    expect(res.status).toBe(400);
  });

  it('토큰 없음 → 401', async () => {
    const res = await request(app).post('/api/v1/categories').send({ name: '테스트' });
    expect(res.status).toBe(401);
  });
});

// ─── PUT /api/v1/categories/:id ───────────────────────────────────────────────
describe('PUT /api/v1/categories/:id', () => {
  let categoryId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ name: `수정대상_${ts}` });
    categoryId = res.body.data.id;
  });

  it('정상 수정 → 200 + 수정된 카테고리', async () => {
    const res = await request(app)
      .put(`/api/v1/categories/${categoryId}`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ name: `수정됨_${ts}` });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe(`수정됨_${ts}`);
  });

  it('기본 카테고리 수정 → 400 VALIDATION_ERROR', async () => {
    const listRes = await request(app)
      .get('/api/v1/categories')
      .set('Authorization', `Bearer ${user1Token}`);
    const defaultCat = listRes.body.data.find(c => c.is_default);

    const res = await request(app)
      .put(`/api/v1/categories/${defaultCat.id}`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ name: '변경시도' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('타인 카테고리 수정 → 403 FORBIDDEN', async () => {
    const res = await request(app)
      .put(`/api/v1/categories/${categoryId}`)
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ name: '해킹시도' });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });
});

// ─── DELETE /api/v1/categories/:id ────────────────────────────────────────────
describe('DELETE /api/v1/categories/:id', () => {
  let deleteCatId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ name: `삭제대상_${ts}` });
    deleteCatId = res.body.data.id;
  });

  it('일반 카테고리 삭제 → 204', async () => {
    const res = await request(app)
      .delete(`/api/v1/categories/${deleteCatId}`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.status).toBe(204);
  });

  it('기본 카테고리 삭제 → 400 VALIDATION_ERROR', async () => {
    const listRes = await request(app)
      .get('/api/v1/categories')
      .set('Authorization', `Bearer ${user1Token}`);
    const defaultCat = listRes.body.data.find(c => c.is_default);

    const res = await request(app)
      .delete(`/api/v1/categories/${defaultCat.id}`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('타인 카테고리 삭제 → 403 FORBIDDEN', async () => {
    const catRes = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ name: `타인삭제시도_${ts}` });
    const catId = catRes.body.data.id;

    const res = await request(app)
      .delete(`/api/v1/categories/${catId}`)
      .set('Authorization', `Bearer ${user2Token}`);

    expect(res.status).toBe(403);
  });

  it('카테고리 삭제 시 todo가 기본 카테고리로 이관', async () => {
    // 새 카테고리 생성
    const catRes = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ name: `이관테스트_${ts}` });
    const catId = catRes.body.data.id;

    // 해당 카테고리에 todo 생성 (DB 직접)
    await query(
      'INSERT INTO todo (user_id, category_id, title) VALUES ($1, $2, $3)',
      [user1Id, catId, '이관될 할일']
    );

    // 카테고리 삭제
    const delRes = await request(app)
      .delete(`/api/v1/categories/${catId}`)
      .set('Authorization', `Bearer ${user1Token}`);
    expect(delRes.status).toBe(204);

    // todo가 기본 카테고리로 이관됐는지 확인
    const listRes = await request(app)
      .get('/api/v1/categories')
      .set('Authorization', `Bearer ${user1Token}`);
    const defaultCat = listRes.body.data.find(c => c.is_default);

    const todoResult = await query(
      'SELECT category_id FROM todo WHERE user_id = $1 AND title = $2',
      [user1Id, '이관될 할일']
    );
    expect(todoResult.rows[0].category_id).toBe(defaultCat.id);
  });
});
