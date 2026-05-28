'use strict';

require('dotenv').config();
const request = require('supertest');
const app = require('../src/app');
const { query } = require('../src/db/pool');

const ts = Date.now();
const user1Email = `todo_u1_${ts}@example.com`;
const user2Email = `todo_u2_${ts}@example.com`;
const password = 'Test1234!';

let user1Id, user2Id, user1Token, user2Token, user1DefaultCatId;

async function registerAndLogin(email) {
  await request(app).post('/api/v1/auth/register').send({ email, password, name: '테스터' });
  const res = await request(app).post('/api/v1/auth/login').send({ email, password });
  return { id: res.body.data.user.id, token: res.body.data.token };
}

beforeAll(async () => {
  const u1 = await registerAndLogin(user1Email);
  const u2 = await registerAndLogin(user2Email);
  user1Id = u1.id; user1Token = u1.token;
  user2Id = u2.id; user2Token = u2.token;

  const catRes = await request(app)
    .get('/api/v1/categories')
    .set('Authorization', `Bearer ${user1Token}`);
  user1DefaultCatId = catRes.body.data.find(c => c.is_default).id;
});

afterAll(async () => {
  if (user1Id) await query('DELETE FROM "user" WHERE id = $1', [user1Id]);
  if (user2Id) await query('DELETE FROM "user" WHERE id = $1', [user2Id]);
});

// ─── POST /api/v1/todos ───────────────────────────────────────────────────────
describe('POST /api/v1/todos', () => {
  it('기본 카테고리로 todo 생성 (category_id 미지정) → 201', async () => {
    const res = await request(app)
      .post('/api/v1/todos')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ title: '기본 할일' });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('기본 할일');
    expect(res.body.data.category_id).toBe(user1DefaultCatId);
    expect(res.body.data.status).toBe('NOT_STARTED');
    expect(res.body.data.is_done).toBe(false);
  });

  it('날짜 포함 todo 생성 → IN_PROGRESS', async () => {
    const today = new Date().toISOString().slice(0, 10);
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    const res = await request(app)
      .post('/api/v1/todos')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ title: '진행중', start_date: today, end_date: tomorrow });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });

  it('title 없음 → 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/api/v1/todos')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it('end_date < start_date → 400', async () => {
    const res = await request(app)
      .post('/api/v1/todos')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ title: '날짜오류', start_date: '2025-06-30', end_date: '2025-06-01' });
    expect(res.status).toBe(400);
  });

  it('토큰 없음 → 401', async () => {
    const res = await request(app).post('/api/v1/todos').send({ title: '테스트' });
    expect(res.status).toBe(401);
  });
});

// ─── GET /api/v1/todos ────────────────────────────────────────────────────────
describe('GET /api/v1/todos', () => {
  it('목록 조회 → { data: [...], total: N }', async () => {
    const res = await request(app)
      .get('/api/v1/todos')
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(typeof res.body.total).toBe('number');
    expect(res.body.data[0]).toHaveProperty('status');
  });

  it('categoryId 필터 적용', async () => {
    const res = await request(app)
      .get(`/api/v1/todos?categoryId=${user1DefaultCatId}`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.status).toBe(200);
    res.body.data.forEach(t => expect(t.category_id).toBe(user1DefaultCatId));
  });

  it('status 필터 적용 (NOT_STARTED)', async () => {
    const res = await request(app)
      .get('/api/v1/todos?status=NOT_STARTED')
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.status).toBe(200);
    res.body.data.forEach(t => expect(t.status).toBe('NOT_STARTED'));
  });

  it('타인 할일은 조회되지 않음', async () => {
    const res = await request(app)
      .get('/api/v1/todos')
      .set('Authorization', `Bearer ${user2Token}`);

    expect(res.status).toBe(200);
    res.body.data.forEach(t => expect(t.user_id).toBe(user2Id));
  });
});

// ─── GET /api/v1/todos/:id ────────────────────────────────────────────────────
describe('GET /api/v1/todos/:id', () => {
  let todoId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/todos')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ title: '단건조회용' });
    todoId = res.body.data.id;
  });

  it('본인 todo 조회 → 200 + status 포함', async () => {
    const res = await request(app)
      .get(`/api/v1/todos/${todoId}`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(todoId);
    expect(res.body.data.status).toBeDefined();
  });

  it('타인 todo 조회 → 403', async () => {
    const res = await request(app)
      .get(`/api/v1/todos/${todoId}`)
      .set('Authorization', `Bearer ${user2Token}`);
    expect(res.status).toBe(403);
  });
});

// ─── PUT /api/v1/todos/:id ────────────────────────────────────────────────────
describe('PUT /api/v1/todos/:id', () => {
  let todoId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/todos')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ title: '수정대상' });
    todoId = res.body.data.id;
  });

  it('title 수정 → 200 + 수정된 내용', async () => {
    const res = await request(app)
      .put(`/api/v1/todos/${todoId}`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ title: '수정됨' });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('수정됨');
  });

  it('타인 todo 수정 → 403', async () => {
    const res = await request(app)
      .put(`/api/v1/todos/${todoId}`)
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ title: '해킹' });
    expect(res.status).toBe(403);
  });
});

// ─── PATCH /api/v1/todos/:id/done ─────────────────────────────────────────────
describe('PATCH /api/v1/todos/:id/done', () => {
  let todoId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/todos')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ title: '완료처리용' });
    todoId = res.body.data.id;
  });

  it('toggleDone → 200 + is_done=true + status=DONE', async () => {
    const res = await request(app)
      .patch(`/api/v1/todos/${todoId}/done`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.is_done).toBe(true);
    expect(res.body.data.status).toBe('DONE');
  });

  it('타인 todo toggleDone → 403', async () => {
    const res = await request(app)
      .patch(`/api/v1/todos/${todoId}/done`)
      .set('Authorization', `Bearer ${user2Token}`);
    expect(res.status).toBe(403);
  });
});

// ─── DELETE /api/v1/todos/:id ─────────────────────────────────────────────────
describe('DELETE /api/v1/todos/:id', () => {
  let todoId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/todos')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ title: '삭제대상' });
    todoId = res.body.data.id;
  });

  it('타인 todo 삭제 → 403', async () => {
    const res = await request(app)
      .delete(`/api/v1/todos/${todoId}`)
      .set('Authorization', `Bearer ${user2Token}`);
    expect(res.status).toBe(403);
  });

  it('본인 todo 삭제 → 204', async () => {
    const res = await request(app)
      .delete(`/api/v1/todos/${todoId}`)
      .set('Authorization', `Bearer ${user1Token}`);
    expect(res.status).toBe(204);
  });

  it('삭제 후 조회 → 403', async () => {
    const res = await request(app)
      .get(`/api/v1/todos/${todoId}`)
      .set('Authorization', `Bearer ${user1Token}`);
    expect(res.status).toBe(403);
  });
});
