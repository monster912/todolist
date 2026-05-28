'use strict';

const { query, getClient } = require('./pool');

async function findAllByUserId(userId) {
  const sql = `
    SELECT id, user_id, name, is_default, created_at, updated_at
    FROM category
    WHERE user_id = $1
    ORDER BY is_default DESC, created_at ASC
  `;
  const result = await query(sql, [userId]);
  return result.rows;
}

async function findByIdAndUserId(id, userId) {
  const sql = `
    SELECT id, user_id, name, is_default, created_at, updated_at
    FROM category
    WHERE id = $1 AND user_id = $2
  `;
  const result = await query(sql, [id, userId]);
  return result.rows[0] || null;
}

async function insertCategory(userId, name) {
  const sql = `
    INSERT INTO category (user_id, name)
    VALUES ($1, $2)
    RETURNING id, user_id, name, is_default, created_at, updated_at
  `;
  const result = await query(sql, [userId, name]);
  return result.rows[0];
}

async function updateCategory(id, name) {
  const sql = `
    UPDATE category
    SET name = $1
    WHERE id = $2
    RETURNING id, user_id, name, is_default, created_at, updated_at
  `;
  const result = await query(sql, [name, id]);
  return result.rows[0] || null;
}

async function reassignTodosToDefault(userId, fromCategoryId) {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const defaultResult = await client.query(
      'SELECT id FROM category WHERE user_id = $1 AND is_default = true',
      [userId]
    );
    const defaultCategoryId = defaultResult.rows[0].id;

    await client.query(
      'UPDATE todo SET category_id = $1 WHERE category_id = $2',
      [defaultCategoryId, fromCategoryId]
    );

    await client.query('DELETE FROM category WHERE id = $1', [fromCategoryId]);

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  findAllByUserId,
  findByIdAndUserId,
  insertCategory,
  updateCategory,
  reassignTodosToDefault,
};
