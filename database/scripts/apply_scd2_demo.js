// database/scripts/apply_scd2_demo.js
// Executes SCD Type 2 transformations with effective_to = '2199-12-31 12:00:00' for active rows
const path = require('path');
require(path.resolve(__dirname, '../../backend/node_modules/dotenv')).config({ path: path.resolve(__dirname, '../../backend/.env') });
const mysql = require(path.resolve(__dirname, '../../backend/node_modules/mysql2/promise'));

const HIGH_DATE = '2199-12-31 12:00:00';

async function applyScd2Demo() {
  console.log('=== APPLYING SCD TYPE 2 TRANSFORMATIONS (HIGH DATE: 2199-12-31 12:00:00) ===\n');

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
    // 0. Update any existing active rows that still have NULL to the high-date sentinel
    await conn.query('UPDATE dw_dim_business SET effective_to = ? WHERE is_current = TRUE', [HIGH_DATE]);
    await conn.query('UPDATE dw_dim_user SET effective_to = ? WHERE is_current = TRUE', [HIGH_DATE]);

    // -------------------------------------------------------------
    // 1. Table 1: dw_dim_business (Business Rebranding: Business ID 1)
    // -------------------------------------------------------------
    console.log('[1/3] Transforming dw_dim_business (Business ID 1 rebrands)...');
    
    // Check if version 2 already exists
    const [existingBizV2] = await conn.query(
      "SELECT * FROM dw_dim_business WHERE business_id = 1 AND name = 'Happy Paws Animal Hospital & Specialty Care'"
    );

    if (existingBizV2.length === 0) {
      await conn.beginTransaction();
      
      // A. Close current active version (set effective_to to current timestamp)
      await conn.query(`
        UPDATE dw_dim_business
        SET effective_to = NOW(), is_current = FALSE
        WHERE business_id = 1 AND is_current = TRUE
      `);

      // B. Insert new active version with high-date '2199-12-31 12:00:00'
      const [insertBizRes] = await conn.query(`
        INSERT INTO dw_dim_business (business_id, name, effective_from, effective_to, is_current)
        VALUES (1, 'Happy Paws Animal Hospital & Specialty Care', NOW(), ?, TRUE)
      `, [HIGH_DATE]);

      await conn.commit();
      console.log(`  ✓ dw_dim_business transformed! New surrogate key business_sk = ${insertBizRes.insertId}`);
    } else {
      // Ensure existing V2 has the high date
      await conn.query(`
        UPDATE dw_dim_business 
        SET effective_to = ? 
        WHERE business_id = 1 AND is_current = TRUE
      `, [HIGH_DATE]);
      console.log(`  ✓ dw_dim_business active row updated with effective_to = ${HIGH_DATE}`);
    }

    // -------------------------------------------------------------
    // 2. Table 2: dw_dim_user (Role Promotion: User ID 17 PARTNER -> OWNER)
    // -------------------------------------------------------------
    console.log('\n[2/3] Transforming dw_dim_user (User ID 17 promoted to OWNER)...');

    const [existingUserV2] = await conn.query(
      "SELECT * FROM dw_dim_user WHERE user_id = 17 AND role = 'OWNER'"
    );

    if (existingUserV2.length === 0) {
      await conn.beginTransaction();

      // A. Close current active version
      await conn.query(`
        UPDATE dw_dim_user
        SET effective_to = NOW(), is_current = FALSE
        WHERE user_id = 17 AND is_current = TRUE
      `);

      // B. Insert new active version with high-date '2199-12-31 12:00:00'
      const [insertUserRes] = await conn.query(`
        INSERT INTO dw_dim_user (user_id, role, effective_from, effective_to, is_current)
        VALUES (17, 'OWNER', NOW(), ?, TRUE)
      `, [HIGH_DATE]);

      await conn.commit();
      console.log(`  ✓ dw_dim_user transformed! New surrogate key user_sk = ${insertUserRes.insertId}`);
    } else {
      // Ensure existing V2 has the high date
      await conn.query(`
        UPDATE dw_dim_user 
        SET effective_to = ? 
        WHERE user_id = 17 AND is_current = TRUE
      `, [HIGH_DATE]);
      console.log(`  ✓ dw_dim_user active row updated with effective_to = ${HIGH_DATE}`);
    }

    // -------------------------------------------------------------
    // 3. Table 3: dw_fact_collaboration (Fact Table Linking to New SCD2 Version)
    // -------------------------------------------------------------
    console.log('\n[3/3] Linking new event to dw_fact_collaboration using current business_sk...');

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const dateKey = parseInt(`${yyyy}${mm}${dd}`, 10);
    const fullDate = `${yyyy}-${mm}-${dd}`;

    await conn.query(`
      INSERT IGNORE INTO dw_dim_date (date_key, full_date, month, year)
      VALUES (?, ?, ?, ?)
    `, [dateKey, fullDate, today.getMonth() + 1, yyyy]);

    const [currentBiz] = await conn.query(
      'SELECT business_sk FROM dw_dim_business WHERE business_id = 1 AND is_current = TRUE'
    );
    const newBusinessSk = currentBiz[0].business_sk;

    const [existingFact] = await conn.query(
      'SELECT * FROM dw_fact_collaboration WHERE initiator_business_sk = ? AND date_key = ?',
      [newBusinessSk, dateKey]
    );

    if (existingFact.length === 0) {
      await conn.query(`
        INSERT INTO dw_fact_collaboration (date_key, initiator_business_sk, partner_business_sk, duration_days, participant_count)
        VALUES (?, ?, 2, 45, 2)
      `, [dateKey, newBusinessSk]);
      console.log(`  ✓ dw_fact_collaboration updated! Added new event pointing to current business_sk = ${newBusinessSk}`);
    } else {
      console.log('  ℹ Fact record for today already exists.');
    }

    // -------------------------------------------------------------
    // Verification Output
    // -------------------------------------------------------------
    console.log('\n======================================================');
    console.log('VERIFICATION: dw_dim_business for business_id = 1:');
    console.log('======================================================');
    const [bizRows] = await conn.query(`
      SELECT 
        business_sk, 
        business_id, 
        name, 
        DATE_FORMAT(effective_from, '%Y-%m-%d %H:%i:%s') AS effective_from, 
        DATE_FORMAT(effective_to, '%Y-%m-%d %H:%i:%s') AS effective_to, 
        is_current 
      FROM dw_dim_business 
      WHERE business_id = 1 
      ORDER BY business_sk ASC
    `);
    console.table(bizRows);

    console.log('\n======================================================');
    console.log('VERIFICATION: dw_dim_user for user_id = 17:');
    console.log('======================================================');
    const [userRows] = await conn.query(`
      SELECT 
        user_sk, 
        user_id, 
        role, 
        DATE_FORMAT(effective_from, '%Y-%m-%d %H:%i:%s') AS effective_from, 
        DATE_FORMAT(effective_to, '%Y-%m-%d %H:%i:%s') AS effective_to, 
        is_current 
      FROM dw_dim_user 
      WHERE user_id = 17 
      ORDER BY user_sk ASC
    `);
    console.table(userRows);

    console.log('\n======================================================');
    console.log('VERIFICATION: dw_fact_collaboration history preservation:');
    console.log('======================================================');
    const [factRows] = await conn.query(`
      SELECT 
        f.fact_id,
        f.date_key,
        f.initiator_business_sk,
        b.name AS initiator_name_at_event_time,
        DATE_FORMAT(b.effective_to, '%Y-%m-%d %H:%i:%s') AS dim_effective_to,
        b.is_current AS is_current_dimension_row,
        f.duration_days
      FROM dw_fact_collaboration f
      JOIN dw_dim_business b ON f.initiator_business_sk = b.business_sk
      WHERE b.business_id = 1
      ORDER BY f.fact_id ASC
    `);
    console.table(factRows);

  } catch (err) {
    console.error('Error applying SCD2 demo:', err);
  } finally {
    conn.release();
    await pool.end();
  }
}

applyScd2Demo();
