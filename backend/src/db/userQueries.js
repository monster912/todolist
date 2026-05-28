'use strict';

const { query } = require('./pool');

async function findByEmail(email) {
  const sql = `
    SELECT id, email, password, name, theme, locale, created_at, updated_at
    FROM "user"
    WHERE email = $1
  `;
  const result = await query(sql, [email]);
  return result.rows[0] || null;
}

async function findById(id) {
  const sql = `
    SELECT id, email, name, theme, locale, created_at, updated_at
    FROM "user"
    WHERE id = $1
  `;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
}

async function insertUser(email, hashedPassword, name) {
  const sql = `
    INSERT INTO "user" (email, password, name)
    VALUES ($1, $2, $3)
    RETURNING id, email, name, theme, locale, created_at, updated_at
  `;
  const result = await query(sql, [email, hashedPassword, name]);
  return result.rows[0];
}

async function updateSettings(userId, { theme, locale }) {
  const sets = [];
  const params = [];
  if (theme !== undefined) { sets.push(`theme = $${params.length + 1}`); params.push(theme); }
  if (locale !== undefined) { sets.push(`locale = $${params.length + 1}`); params.push(locale); }
  if (sets.length === 0) return null;
  params.push(userId);
  const sql = `
    UPDATE "user"
    SET ${sets.join(', ')}
    WHERE id = $${params.length}
    RETURNING id, email, name, theme, locale, created_at, updated_at
  `;
  const result = await query(sql, params);
  return result.rows[0] || null;
}

async function updateUser(userId, data) {
  const sets = [];
  const params = [];
  if (data.name !== undefined) { sets.push(`name = $${params.length + 1}`); params.push(data.name); }
  if (data.password !== undefined) { sets.push(`password = $${params.length + 1}`); params.push(data.password); }
  if (sets.length === 0) return null;
  params.push(userId);
  const sql = `
    UPDATE "user"
    SET ${sets.join(', ')}
    WHERE id = $${params.length}
    RETURNING id, email, name, theme, locale, created_at, updated_at
  `;
  const result = await query(sql, params);
  return result.rows[0] || null;
}

async function deleteUser(userId) {
  await query('DELETE FROM "user" WHERE id = $1', [userId]);
}

module.exports = { findByEmail, findById, insertUser, updateSettings, updateUser, deleteUser };
