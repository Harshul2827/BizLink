// database/tests/test_fk_integrity.js
// Tests that MySQL enforces foreign-key constraints:
//   - Orphan inserts referencing non-existent parent rows are rejected
//   - CASCADE deletes remove dependent rows correctly

const db = require('./db');

let passed = 0;
let failed = 0;

async function expect_failure(label, sql, values) {
  const conn = await db.getConnection();
  try {
    await conn.execute(sql, values);
    console.error(`  FAIL  [${label}] — expected FK error but got none`);
    failed++;
  } catch (err) {
    if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_NO_REFERENCED_ROW' || err.errno === 1452) {
      console.log(`  PASS  [${label}] — correctly rejected orphan insert (${err.code})`);
      passed++;
    } else {
      console.error(`  FAIL  [${label}] — unexpected error: ${err.code} ${err.message}`);
      failed++;
    }
  } finally {
    conn.release();
  }
}

async function expect_count(label, sql, values, expectedCount) {
  const conn = await db.getConnection();
  try {
    const [rows] = await conn.execute(sql, values);
    const count = rows[0]['count'];
    if (count === expectedCount) {
      console.log(`  PASS  [${label}] — count = ${count} as expected`);
      passed++;
    } else {
      console.error(`  FAIL  [${label}] — expected count ${expectedCount} but got ${count}`);
      failed++;
    }
  } catch (err) {
    console.error(`  FAIL  [${label}] — query error: ${err.message}`);
    failed++;
  } finally {
    conn.release();
  }
}

async function run() {
  console.log('\n=== Foreign Key Integrity Tests ===\n');

  // 1. Insert service referencing non-existent business
  await expect_failure(
    'services.business_id FK — orphan insert',
    `INSERT INTO services (business_id, title, status) VALUES (?, ?, ?)`,
    [99999, 'Ghost Service', 'ACTIVE']
  );

  // 2. Insert need referencing non-existent category
  await expect_failure(
    'needs.category_id FK — orphan insert',
    `INSERT INTO needs (business_id, category_id, title) VALUES (?, ?, ?)`,
    [1, 99999, 'Ghost Need']
  );

  // 3. Insert message referencing non-existent connection
  await expect_failure(
    'messages.connection_id FK — orphan insert',
    `INSERT INTO messages (connection_id, sender_user_id, sender_business_id, body) VALUES (?, ?, ?, ?)`,
    [99999, 2, 1, 'Test message']
  );

  // 4. Insert review referencing non-existent business
  await expect_failure(
    'reviews.reviewed_business_id FK — orphan insert',
    `INSERT INTO reviews (reviewer_business_id, reviewed_business_id, author_user_id, rating) VALUES (?, ?, ?, ?)`,
    [1, 99999, 2, 4]
  );

  // 5. Insert collaboration_participant referencing non-existent collaboration
  await expect_failure(
    'collaboration_participants.collaboration_id FK — orphan insert',
    `INSERT INTO collaboration_participants (collaboration_id, business_id, participant_role) VALUES (?, ?, ?)`,
    [99999, 1, 'PARTNER']
  );

  // 6. Insert match referencing non-existent service
  await expect_failure(
    'matches.service_id FK — orphan insert',
    `INSERT INTO matches (need_id, service_id, score) VALUES (?, ?, ?)`,
    [1, 99999, 0.90]
  );

  // 7. Insert business_member referencing non-existent user
  await expect_failure(
    'business_members.user_id FK — orphan insert',
    `INSERT INTO business_members (business_id, user_id, member_role) VALUES (?, ?, ?)`,
    [1, 99999, 'STAFF']
  );

  // 8. CASCADE DELETE test — verify services are deleted when business is deleted
  //    We use a temp business to avoid corrupting seed data
  const conn = await db.getConnection();
  try {
    await conn.execute(
      `INSERT INTO users (user_id, email, password_hash, full_name, role) VALUES (999, 'temp_cascade@test.com', 'hash', 'Temp User', 'OWNER')`
    );
    await conn.execute(
      `INSERT INTO businesses (business_id, owner_user_id, name, slug, status) VALUES (999, 999, 'Temp Biz', 'temp-biz-cascade', 'ACTIVE')`
    );
    await conn.execute(
      `INSERT INTO services (service_id, business_id, title, status) VALUES (999, 999, 'Temp Service', 'ACTIVE')`
    );
    await conn.execute(`DELETE FROM businesses WHERE business_id = 999`);
    const [rows] = await conn.execute(`SELECT COUNT(*) as count FROM services WHERE service_id = 999`);
    const remaining = rows[0]['count'];
    if (remaining === 0) {
      console.log(`  PASS  [services CASCADE DELETE on business] — service removed correctly`);
      passed++;
    } else {
      console.error(`  FAIL  [services CASCADE DELETE on business] — ${remaining} orphan services remain`);
      failed++;
    }
    // Cleanup temp user
    await conn.execute(`DELETE FROM users WHERE user_id = 999`);
  } catch (err) {
    console.error(`  FAIL  [CASCADE DELETE test] — setup error: ${err.message}`);
    failed++;
  } finally {
    conn.release();
  }

  // 9. Verify all services reference valid businesses
  await expect_count(
    'services — no orphan business_id references',
    `SELECT COUNT(*) as count FROM services s
     LEFT JOIN businesses b ON s.business_id = b.business_id
     WHERE b.business_id IS NULL`,
    [],
    0
  );

  // 10. Verify all needs reference valid businesses
  await expect_count(
    'needs — no orphan business_id references',
    `SELECT COUNT(*) as count FROM needs n
     LEFT JOIN businesses b ON n.business_id = b.business_id
     WHERE b.business_id IS NULL`,
    [],
    0
  );

  console.log(`\n=== FK Integrity Results: ${passed} passed, ${failed} failed ===\n`);
  return { passed, failed };
}

if (require.main === module) {
  run().then(res => {
    db.end();
    process.exit(res.failed > 0 ? 1 : 0);
  }).catch(err => {
    console.error('Unexpected test runner error:', err);
    process.exit(1);
  });
}

module.exports = { run };

