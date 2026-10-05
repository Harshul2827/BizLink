// database/tests/test_constraints.js
// Tests that MySQL enforces schema-level constraints:
//   - UNIQUE violations (email, slug)
//   - CHECK constraint on reviews.rating (1–5)
//   - ENUM violations
//   - NOT NULL violations
// Each test attempts an illegal INSERT and expects it to fail.

const db = require('./db');

let passed = 0;
let failed = 0;

async function expect_failure(label, sql, values) {
  const conn = await db.getConnection();
  try {
    await conn.execute(sql, values);
    console.error(`  FAIL  [${label}] — expected constraint error but got none`);
    failed++;
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY' || err.code === 'ER_BAD_NULL_ERROR' ||
        err.code === 'ER_CHECK_CONSTRAINT_VIOLATED' || err.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD' ||
        err.code === 'ER_DATA_TOO_LONG' || err.errno === 1048 || err.errno === 1292 || err.errno === 3819) {
      console.log(`  PASS  [${label}] — correctly rejected (${err.code || err.errno})`);
      passed++;
    } else {
      console.error(`  FAIL  [${label}] — unexpected error: ${err.code} ${err.message}`);
      failed++;
    }
  } finally {
    conn.release();
  }
}

async function run() {
  console.log('\n=== Constraint Violation Tests ===\n');

  // 1. Duplicate email in users
  await expect_failure(
    'users.email UNIQUE',
    `INSERT INTO users (email, password_hash, full_name, role) VALUES (?, ?, ?, ?)`,
    ['admin@bizlink.com', 'hash', 'Duplicate Admin', 'ADMIN']
  );

  // 2. Duplicate slug in businesses
  await expect_failure(
    'businesses.slug UNIQUE',
    `INSERT INTO businesses (owner_user_id, name, slug, status) VALUES (?, ?, ?, ?)`,
    [2, 'Duplicate Business', 'happy-paws-clinic', 'ACTIVE']
  );

  // 3. reviews.rating CHECK (value = 6, out of range)
  await expect_failure(
    'reviews.rating CHECK (1–5)',
    `INSERT INTO reviews (reviewer_business_id, reviewed_business_id, author_user_id, rating, title)
     VALUES (?, ?, ?, ?, ?)`,
    [1, 2, 2, 6, 'Out-of-range rating']
  );

  // 4. reviews.rating CHECK (value = 0, out of range)
  await expect_failure(
    'reviews.rating CHECK (0 rejected)',
    `INSERT INTO reviews (reviewer_business_id, reviewed_business_id, author_user_id, rating, title)
     VALUES (?, ?, ?, ?, ?)`,
    [1, 2, 2, 0, 'Zero rating']
  );

  // 5. users.role ENUM (invalid value)
  await expect_failure(
    'users.role ENUM validation',
    `INSERT INTO users (email, password_hash, full_name, role) VALUES (?, ?, ?, ?)`,
    ['invalid_role@test.com', 'hash', 'Bad Role User', 'MANAGER']
  );

  // 6. connections.status ENUM (invalid value)
  await expect_failure(
    'connections.status ENUM validation',
    `INSERT INTO connections (requester_business_id, receiver_business_id, status) VALUES (?, ?, ?)`,
    [1, 3, 'CONFIRMED']
  );

  // 7. users.email NOT NULL
  await expect_failure(
    'users.email NOT NULL',
    `INSERT INTO users (password_hash, full_name, role) VALUES (?, ?, ?)`,
    ['hash', 'No Email User', 'OWNER']
  );

  // 8. businesses.owner_user_id NOT NULL
  await expect_failure(
    'businesses.owner_user_id NOT NULL',
    `INSERT INTO businesses (name, slug, status) VALUES (?, ?, ?)`,
    ['No Owner Biz', 'no-owner-biz', 'ACTIVE']
  );

  // 9. Duplicate (requester, receiver) in connections
  await expect_failure(
    'connections UNIQUE (requester, receiver)',
    `INSERT INTO connections (requester_business_id, receiver_business_id, status) VALUES (?, ?, ?)`,
    [1, 2, 'PENDING']
  );

  // 10. categories.slug UNIQUE
  await expect_failure(
    'categories.slug UNIQUE',
    `INSERT INTO categories (name, slug) VALUES (?, ?)`,
    ['Duplicate Cat', 'healthcare']
  );

  console.log(`\n=== Constraints Results: ${passed} passed, ${failed} failed ===\n`);
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

