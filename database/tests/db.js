// database/tests/db.js
// Shared MySQL2 connection pool for all test files.
// Configure via environment variables or defaults for local dev.
// Usage: const db = require('./db');

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '3306'),
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'bizlink',
  waitForConnections: true,
  connectionLimit: 5,
});

module.exports = pool;
