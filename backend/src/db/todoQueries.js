'use strict';

const { query } = require('./pool');

async function findAllByUserId(userId, { categoryId } = {}) {
  const params = [userId];
  let sql = `
    SELECT id, user_id, category_id, title, description,
           is_done, start_date, end_date, created_at, updated_at
    FROM todo
    WHERE user_id = $1
  `;
  if (categoryId) {
    params.push(categoryId);
    sql += ` AND category_id = $${params.length}`;
  }
  sql += ' ORDER BY created_at DESC';
  const result = await query(sql, params);
  return result.rows;
}

async function findByIdAndUserId(id, userId) {
  const sql = `
    SELECT id, user_id, category_id, title, description,
           is_done, start_date, end_date, created_at, updated_at
    FROM todo
    WHERE id = $1 AND user_id = $2
  `;
  const result = await query(sql, [id, userId]);
  return result.rows[0] || null;
}

async function insertTodo(userId, categoryId, data) {
  const { title, description = null, start_date = null, end_date = null } = data;
  const sql = `
    INSERT INTO todo (user_id, category_id, title, description, start_date, end_date)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, user_id, category_id, title, description,
              is_done, start_date, end_date, created_at, updated_at
  `;
  const result = await query(sql, [userId, categoryId, title.trim(), description, start_date, end_date]);
  return result.rows[0];
}

async function updateTodo(id, data) {
  const ALLOWED = ['title', 'description', 'category_id', 'is_done', 'start_date', 'end_date'];
  const sets = [];
  const params = [];

  for (const [key, val] of Object.entries(data)) {
    if (ALLOWED.includes(key)) {
      sets.push(`${key} = $${params.length + 1}`);
      params.push(val);
    }
  }

  if (sets.length === 0) return null;

  params.push(id);
  const sql = `
    UPDATE todo
    SET ${sets.join(', ')}
    WHERE id = $${params.length}
    RETURNING id, user_id, category_id, title, description,
              is_done, start_date, end_date, created_at, updated_at
  `;
  const result = await query(sql, params);
  return result.rows[0] || null;
}

async function deleteTodo(id) {
  await query('DELETE FROM todo WHERE id = $1', [id]);
}

module.exports = { findAllByUserId, findByIdAndUserId, insertTodo, updateTodo, deleteTodo };
