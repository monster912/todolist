'use strict';

const { Pool } = require('pg');

const pool = new Pool({
  host:                 process.env.DB_HOST,
  port:                 parseInt(process.env.DB_PORT, 10),
  database:             process.env.DB_NAME,
  user:                 process.env.DB_USER,
  password:             process.env.DB_PASSWORD,
  max:                  parseInt(process.env.DB_POOL_MAX, 10) || 10,
  idleTimeoutMillis:    parseInt(process.env.DB_POOL_IDLE_TIMEOUT_MS, 10) || 30000,
  connectionTimeoutMillis: 5000,
});

async function query(text, params) {
  return pool.query(text, params);
}

async function testConnection() {
  try {
    await pool.query('SELECT 1');
    console.warn('DB 연결 성공 (%s:%s/%s)', process.env.DB_HOST, process.env.DB_PORT, process.env.DB_NAME);
  } catch (err) {
    console.error('DB 연결 실패:', err.message);
    throw err;
  }
}

async function getClient() {
  return pool.connect();
}

module.exports = { query, getClient, testConnection };
