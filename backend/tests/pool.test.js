'use strict';

require('dotenv').config();
const { query, testConnection } = require('../src/db/pool');

describe('BE-02 · DB 연결 풀', () => {
  it('SELECT 1 쿼리가 성공한다', async () => {
    const result = await query('SELECT 1 AS val');
    expect(result.rows[0].val).toBe(1);
  });

  it('testConnection()이 에러 없이 완료된다', async () => {
    await expect(testConnection()).resolves.not.toThrow();
  });

  it('파라미터화 쿼리가 동작한다', async () => {
    const result = await query('SELECT $1::int AS num', [42]);
    expect(result.rows[0].num).toBe(42);
  });

  it('잘못된 쿼리는 에러를 throw한다', async () => {
    await expect(query('SELECT * FROM nonexistent_table_xyz')).rejects.toThrow();
  });
});
