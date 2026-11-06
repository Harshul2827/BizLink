// database/scripts/reset_scd2_demo.js
// Resets dw_dim_business, dw_dim_user, and dw_fact_collaboration to initial seed state
// with effective_to = '2199-12-31 12:00:00' for all active rows
const path = require('path');
require(path.resolve(__dirname, '../../backend/node_modules/dotenv')).config({ path: path.resolve(__dirname, '../../backend/.env') });
const mysql = require(path.resolve(__dirname, '../../backend/node_modules/mysql2/promise'));

const HIGH_DATE = '2199-12-31 12:00:00';

async function resetScd2Demo() {
  console.log('=== RESETTING SCD TYPE 2 DEMO STATE ===\n');

  const pool = mysql.createPool({
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT || '3306', 10),
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'bizlink',
    waitForConnections: true,
    connectionLimit: 5,
  });

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Remove new fact row
    console.log('[1/3] Cleaning up demo fact rows...');
    await conn.query('DELETE FROM dw_fact_collaboration WHERE fact_id > 2');

    // 2. Reset dw_dim_business
    console.log('[2/3] Resetting dw_dim_business for business_id = 1...');
    await conn.query('DELETE FROM dw_dim_business WHERE business_id = 1 AND is_current = TRUE AND business_sk > 15');
    await conn.query('UPDATE dw_dim_business SET effective_to = ?, is_current = TRUE WHERE business_id = 1 AND business_sk = 1', [HIGH_DATE]);

    // 3. Reset dw_dim_user
    console.log('[3/3] Resetting dw_dim_user for user_id = 17...');
    await conn.query('DELETE FROM dw_dim_user WHERE user_id = 17 AND is_current = TRUE AND user_sk > 20');
    await conn.query('UPDATE dw_dim_user SET effective_to = ?, is_current = TRUE WHERE user_id = 17 AND user_sk = 17', [HIGH_DATE]);

    await conn.commit();
    console.log('\n✓ Demo state reset successfully back to clean seed state (effective_to = 2199-12-31 12:00:00)!');

  } catch (err) {
    await conn.rollback();
    console.error('Error resetting demo state:', err);
  } finally {
    conn.release();
    await pool.end();
  }
}

resetScd2Demo();
