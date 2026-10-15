require('dotenv').config();
const pool = require('../db');

async function inspect() {
  console.log('=== BIZLINK DATABASE AUDIT ===\n');

  // 1. List all base tables
  const [tables] = await pool.query("SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'");
  const tableNames = tables.map(r => Object.values(r)[0]);

  const audit = [];

  for (const table of tableNames) {
    const [countRows] = await pool.query(`SELECT COUNT(*) as cnt FROM \`${table}\``);
    const [statusRows] = await pool.query(`SHOW TABLE STATUS LIKE '${table}'`);
    const count = countRows[0].cnt;
    const autoInc = statusRows[0]?.Auto_increment;

    // Check primary key and max id if auto_increment exists
    let maxId = null;
    let minId = null;
    if (autoInc !== null && autoInc !== undefined) {
      // Find PK column
      const [colRows] = await pool.query(`SHOW KEYS FROM \`${table}\` WHERE Key_name = 'PRIMARY'`);
      const pkCol = colRows[0]?.Column_name;
      if (pkCol) {
        const [maxRows] = await pool.query(`SELECT MIN(\`${pkCol}\`) as min_id, MAX(\`${pkCol}\`) as max_id FROM \`${table}\``);
        minId = maxRows[0]?.min_id;
        maxId = maxRows[0]?.max_id;
      }
    }

    audit.push({
      table,
      rows: count,
      minId,
      maxId,
      autoIncrement: autoInc,
      anomaly: (autoInc && maxId && autoInc > maxId + 1) ? `GAP: next is ${autoInc} but max is ${maxId}` : null
    });
  }

  console.table(audit);

  // 2. Foreign Key & Orphan Audit
  console.log('\n=== ORPHAN RECORD CHECK ===');
  const orphanChecks = [
    { table: 'businesses', fk: 'owner_user_id', parent: 'users', pk: 'user_id' },
    { table: 'businesses', fk: 'primary_category_id', parent: 'categories', pk: 'category_id' },
    { table: 'business_members', fk: 'business_id', parent: 'businesses', pk: 'business_id' },
    { table: 'business_members', fk: 'user_id', parent: 'users', pk: 'user_id' },
    { table: 'services', fk: 'business_id', parent: 'businesses', pk: 'business_id' },
    { table: 'services', fk: 'category_id', parent: 'categories', pk: 'category_id' },
    { table: 'needs', fk: 'business_id', parent: 'businesses', pk: 'business_id' },
    { table: 'needs', fk: 'category_id', parent: 'categories', pk: 'category_id' },
    { table: 'matches', fk: 'need_id', parent: 'needs', pk: 'need_id' },
    { table: 'matches', fk: 'service_id', parent: 'services', pk: 'service_id' },
    { table: 'connections', fk: 'requester_business_id', parent: 'businesses', pk: 'business_id' },
    { table: 'connections', fk: 'receiver_business_id', parent: 'businesses', pk: 'business_id' },
    { table: 'messages', fk: 'connection_id', parent: 'connections', pk: 'connection_id' },
    { table: 'messages', fk: 'sender_user_id', parent: 'users', pk: 'user_id' },
    { table: 'collaborations', fk: 'initiator_business_id', parent: 'businesses', pk: 'business_id' },
    { table: 'collaborations', fk: 'need_id', parent: 'needs', pk: 'need_id' },
    { table: 'collaborations', fk: 'service_id', parent: 'services', pk: 'service_id' },
    { table: 'collaboration_participants', fk: 'collaboration_id', parent: 'collaborations', pk: 'collaboration_id' },
    { table: 'collaboration_participants', fk: 'business_id', parent: 'businesses', pk: 'business_id' },
    { table: 'reviews', fk: 'reviewer_business_id', parent: 'businesses', pk: 'business_id' },
    { table: 'reviews', fk: 'reviewed_business_id', parent: 'businesses', pk: 'business_id' },
    { table: 'reviews', fk: 'author_user_id', parent: 'users', pk: 'user_id' },
    { table: 'posts', fk: 'business_id', parent: 'businesses', pk: 'business_id' },
    { table: 'posts', fk: 'author_user_id', parent: 'users', pk: 'user_id' },
    { table: 'post_interactions', fk: 'post_id', parent: 'posts', pk: 'post_id' },
    { table: 'post_interactions', fk: 'user_id', parent: 'users', pk: 'user_id' },
    { table: 'reports', fk: 'reporter_user_id', parent: 'users', pk: 'user_id' },
    { table: 'activity_events', fk: 'user_id', parent: 'users', pk: 'user_id' },
    { table: 'activity_events', fk: 'business_id', parent: 'businesses', pk: 'business_id' },
  ];

  for (const check of orphanChecks) {
    const [orphans] = await pool.query(
      `SELECT COUNT(*) as count FROM \`${check.table}\` t 
       LEFT JOIN \`${check.parent}\` p ON t.\`${check.fk}\` = p.\`${check.pk}\` 
       WHERE t.\`${check.fk}\` IS NOT NULL AND p.\`${check.pk}\` IS NULL`
    );
    if (orphans[0].count > 0) {
      console.error(`ORPHAN FOUND: ${check.table}.${check.fk} -> ${check.parent}.${check.pk}: ${orphans[0].count} orphans`);
    } else {
      console.log(`✓ ${check.table}.${check.fk} -> ${check.parent}.${check.pk}: Clean (0 orphans)`);
    }
  }

  // 3. User 1000 references
  console.log('\n=== USER 1000 AUDIT ===');
  const user1000Refs = [];
  for (const check of orphanChecks.filter(c => c.parent === 'users')) {
    const [rows] = await pool.query(`SELECT COUNT(*) as count FROM \`${check.table}\` WHERE \`${check.fk}\` = 1000`);
    if (rows[0].count > 0) {
      user1000Refs.push({ table: check.table, column: check.fk, count: rows[0].count });
    }
  }
  console.log('Tables referencing user_id 1000:', user1000Refs);

  // 4. Data Warehouse sync
  console.log('\n=== DATA WAREHOUSE SYNC AUDIT ===');
  const [usersCount] = await pool.query('SELECT COUNT(*) as c FROM users');
  const [dwUsersCount] = await pool.query('SELECT COUNT(DISTINCT user_id) as c FROM dw_dim_user');
  console.log(`Users in OLTP: ${usersCount[0].c}, Unique users in DW: ${dwUsersCount[0].c}`);

  const [bizCount] = await pool.query('SELECT COUNT(*) as c FROM businesses');
  const [dwBizCount] = await pool.query('SELECT COUNT(DISTINCT business_id) as c FROM dw_dim_business');
  console.log(`Businesses in OLTP: ${bizCount[0].c}, Unique businesses in DW: ${dwBizCount[0].c}`);

  // 5. Check last_login_at in users table
  console.log('\n=== USERS LAST_LOGIN_AT AUDIT ===');
  const [nullLogins] = await pool.query('SELECT user_id, email, full_name, role, status, last_login_at, created_at FROM users WHERE last_login_at IS NULL');
  console.log(`Users with last_login_at = NULL: ${nullLogins.length} out of ${usersCount[0].c}`);
  console.table(nullLogins.map(u => ({ id: u.user_id, email: u.email, name: u.full_name, role: u.role, created: u.created_at })));

  // 6. Test views
  console.log('\n=== VIEWS AUDIT ===');
  const [views] = await pool.query("SHOW FULL TABLES WHERE Table_type = 'VIEW'");
  for (const v of views) {
    const viewName = Object.values(v)[0];
    try {
      const [vRows] = await pool.query(`SELECT COUNT(*) as cnt FROM \`${viewName}\``);
      console.log(`✓ View ${viewName}: functional (${vRows[0].cnt} rows)`);
    } catch (err) {
      console.error(`✗ View ${viewName} ERROR:`, err.message);
    }
  }

  process.exit(0);
}

inspect().catch(err => {
  console.error(err);
  process.exit(1);
});
