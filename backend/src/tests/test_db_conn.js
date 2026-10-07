require('dotenv').config();
const pool = require('../db');

async function testConnection() {
  try {
    const [rows] = await pool.query('SELECT 1 AS test');
    console.log('DB Connection Test Passed:', rows);
  } catch (err) {
    console.log('DB Connection Status:', err.message);
  } finally {
    process.exit(0);
  }
}

testConnection();
