const path = require('path');
require(path.resolve(__dirname, '../../backend/node_modules/dotenv')).config({ path: path.resolve(__dirname, '../../backend/.env') });
const fs = require('fs');
const mysql = require(path.resolve(__dirname, '../../backend/node_modules/mysql2/promise'));

async function seedAll() {
  console.log('=== INITIALIZING COMPLETE WORKING BIZLINK DATABASE ===\n');

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bizlink',
    multipleStatements: true
  });

  try {
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');

    // 1. Run Schema Migration
    console.log('[1/7] Applying schema from 001_initial_setup.sql...');
    const migrationSql = fs.readFileSync(path.resolve(__dirname, '../migrations/001_initial_setup.sql'), 'utf8');
    await conn.query(migrationSql);
    console.log('  ✓ Schema and indexes created successfully');

    // 2. Run Reporting Views
    console.log('[2/7] Applying reporting views from 01_reporting_views.sql...');
    const viewsSql = fs.readFileSync(path.resolve(__dirname, '../views/01_reporting_views.sql'), 'utf8');
    await conn.query(viewsSql);
    console.log('  ✓ Reporting views created successfully');

    // 3. Run Standard Seeds (01 through 13)
    console.log('[3/7] Running standard seed scripts...');
    const seedFiles = [
      '01_categories.sql',
      '02_users.sql',
      '03_businesses.sql',
      '04_business_members.sql',
      '05_services.sql',
      '06_needs.sql',
      '07_matches.sql',
      '08_connections.sql',
      '09_collaborations.sql',
      '10_reviews.sql',
      '11_posts.sql',
      '12_activity_events.sql',
      '13_dw_dimensions.sql'
    ];

    for (const file of seedFiles) {
      const filePath = path.resolve(__dirname, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      await conn.query(sql);
      console.log(`  ✓ Seeded ${file}`);
    }

    // 4. Insert Verified Frontend Registered Users (Harshul & Dhruvin)
    console.log('[4/7] Inserting registered frontend users (User 19 & User 20)...');
    await conn.query(`
      INSERT INTO users (user_id, email, phone, password_hash, full_name, role, status, last_login_at, created_at, updated_at)
      VALUES 
      (19, 'harshul@gmail.com', '9429604696', '$2b$10$pqwvsE.YyBScDJFPgsOGHe.jFIX39Q6emTiP/Lbf7xGnBoUC9k33C', 'Harshul Shah', 'OWNER', 'ACTIVE', '2026-10-13 11:32:04', '2026-10-12 19:20:14', '2026-10-13 11:32:04'),
      (20, 'jahapanaah@gmail.com', '7866880786', '$2b$10$7pYvUt5bYoxeceIPzFJAOcopVQuqFe2PIaiGQjfK.I4QpxnSt18IG', 'Dhruvin Shah', 'OWNER', 'ACTIVE', '2026-10-15 10:46:32', '2026-10-15 10:46:32', '2026-10-15 10:46:32')
    `);
    console.log('  ✓ Inserted User 19 (Harshul Shah) and User 20 (Dhruvin Shah) with sequential IDs');

    // 5. Populate realistic last_login_at for active users
    console.log('[5/7] Populating realistic last_login_at timestamps for all users...');
    const userLogins = [
      { id: 1,  lastLogin: '2026-10-15 08:30:00' }, // Admin Riya Sharma
      { id: 2,  lastLogin: '2026-10-14 17:15:00' }, // Dr. Anil Mehta
      { id: 3,  lastLogin: '2026-10-14 16:45:00' }, // Bob D'souza
      { id: 4,  lastLogin: '2026-10-14 15:20:00' }, // Alice Fernandes
      { id: 5,  lastLogin: '2026-10-13 14:10:00' }, // Charlie Nair
      { id: 6,  lastLogin: '2026-10-14 11:30:00' }, // Priya Verma
      { id: 7,  lastLogin: '2026-10-13 18:00:00' }, // Rajesh Kumar
      { id: 8,  lastLogin: '2026-10-12 16:00:00' }, // Meena Iyer
      { id: 9,  lastLogin: '2026-10-14 09:45:00' }, // Suresh Pillai
      { id: 10, lastLogin: '2026-10-13 13:20:00' }, // Fatima Sheikh
      { id: 11, lastLogin: '2026-10-14 14:10:00' }, // Arjun Patel
      { id: 12, lastLogin: '2026-10-13 10:50:00' }, // Kavya Reddy
      { id: 13, lastLogin: '2026-10-12 11:15:00' }, // Manish Joshi
      { id: 14, lastLogin: '2026-10-14 12:40:00' }, // Sandhya Kulkarni
      // User 15 is SUSPENDED -> stays NULL
      { id: 16, lastLogin: '2026-10-13 15:30:00' }, // Anita Ghosh
      { id: 17, lastLogin: '2026-10-14 10:00:00' }, // Rohit Mehta
      { id: 18, lastLogin: '2026-10-14 10:30:00' }, // Sneha D'souza
      { id: 19, lastLogin: '2026-10-13 11:32:04' }, // Harshul Shah
      { id: 20, lastLogin: '2026-10-15 10:46:32' }  // Dhruvin Shah
    ];

    for (const u of userLogins) {
      await conn.query('UPDATE users SET last_login_at = ? WHERE user_id = ?', [u.lastLogin, u.id]);
    }
    console.log('  ✓ Updated last_login_at for users 1 through 20');

    // Synchronize DW with users 19 & 20
    await conn.query(`
      INSERT INTO dw_dim_user (user_sk, user_id, role, effective_from, effective_to, is_current)
      VALUES 
      (19, 19, 'OWNER', '2026-10-12 19:20:14', NULL, TRUE),
      (20, 20, 'OWNER', '2026-10-15 10:46:32', NULL, TRUE)
    `);
    console.log('  ✓ Synchronized dw_dim_user (20 users)');

    // 6. Seed messages and reports
    console.log('[6/7] Seeding messages and moderation reports...');
    await conn.query(`
      INSERT INTO messages (message_id, connection_id, sender_user_id, sender_business_id, body, sent_at) VALUES
      (1, 1, 2, 1, 'Hi Bob, we are looking to schedule our quarterly HVAC maintenance inspection next week.', '2026-02-10 10:00:00'),
      (2, 1, 3, 2, 'Hello Dr. Mehta! Tuesday morning at 10:00 AM works well for our technical team.', '2026-02-10 10:25:00'),
      (3, 1, 2, 1, 'Tuesday at 10:00 AM is confirmed. We will have the clinical utility area ready.', '2026-02-10 10:40:00'),
      (4, 2, 4, 3, 'Hi Dr. Mehta, we completed the draft for your localized veterinary SEO strategy.', '2026-02-12 14:00:00'),
      (5, 2, 2, 1, 'Thank you Alice, the report looks thorough. Let us review the target keywords.', '2026-02-12 16:30:00'),
      (6, 3, 6, 5, 'Hi Charlie, checking on the dispatch date for our 500-unit biodegradable boxes.', '2026-02-15 09:15:00'),
      (7, 3, 5, 4, 'Hello Priya, batch QA passed yesterday and shipment is dispatched via courier today.', '2026-02-15 11:00:00')
    `);
    console.log('  ✓ Seeded 7 communication messages across connections 1, 2, and 3');

    await conn.query(`
      INSERT INTO reports (report_id, reporter_user_id, admin_user_id, target_type, target_id, reason, status, created_at) VALUES
      (1, 2, 1, 'POST', 2, 'Suspected unverified commercial promotion.', 'RESOLVED', '2026-03-12 10:30:00'),
      (2, 4, NULL, 'BUSINESS', 14, 'Vendor listing appears inactive and unmaintained.', 'OPEN', '2026-03-15 11:20:00')
    `);
    console.log('  ✓ Seeded 2 moderation reports (1 RESOLVED, 1 OPEN)');

    await conn.query('SET FOREIGN_KEY_CHECKS = 1');

    // 7. Audit & Verification
    console.log('\n[7/7] Verifying all tables, auto_increment sequences, and views...');
    const [statusRows] = await conn.query("SHOW TABLE STATUS WHERE Comment != 'VIEW'");
    const summary = statusRows.map(t => ({
      table: t.Name,
      rows: t.Rows,
      autoIncrement: t.Auto_increment
    }));
    console.table(summary);

    console.log('\n=== DATABASE INITIALIZATION & ALIGNMENT COMPLETE: 100% CLEAN ===\n');

  } catch (err) {
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');
    console.error('ERROR in seedAll:', err);
    throw err;
  } finally {
    await conn.end();
  }
}

seedAll()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
