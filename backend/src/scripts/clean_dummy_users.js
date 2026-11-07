require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const pool = require('../db');

async function cleanDummyUsers() {
  console.log('--- Inspecting and Cleaning Dummy Test Users ---');
  const [dummyUsers] = await pool.query(
    `SELECT user_id, email, full_name, created_at 
     FROM users 
     WHERE email LIKE '%conntest.com%' 
        OR email LIKE '%biztest.com%' 
        OR email LIKE '%test.com%' 
        OR email LIKE '%bizlinktest.com%'
        OR email LIKE '%example.com%'`
  );

  console.log(`Found ${dummyUsers.length} dummy/test user records in database:`);
  console.table(dummyUsers);

  if (dummyUsers.length > 0) {
    const userIds = dummyUsers.map(u => u.user_id);
    
    // Disable FK checks to safely delete orphaned test rows
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Clean up any test records referencing these users
    await pool.query('DELETE FROM user_otps WHERE email IN (?)', [dummyUsers.map(u => u.email)]);
    await pool.query('DELETE FROM activity_events WHERE user_id IN (?)', [userIds]);
    await pool.query('DELETE FROM reviews WHERE author_user_id IN (?)', [userIds]);
    await pool.query('DELETE FROM posts WHERE author_user_id IN (?)', [userIds]);
    await pool.query('DELETE FROM business_members WHERE user_id IN (?)', [userIds]);
    await pool.query('DELETE FROM businesses WHERE owner_user_id IN (?)', [userIds]);
    await pool.query('DELETE FROM users WHERE user_id IN (?)', [userIds]);
    
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log(`✓ Successfully purged ${dummyUsers.length} dummy test records from database.`);
  }

  // Display remaining clean users
  const [cleanUsers] = await pool.query('SELECT user_id, email, full_name, role, email_verified FROM users ORDER BY user_id ASC');
  console.log('\n--- Cleaned Active Database Users ---');
  console.table(cleanUsers);

  await pool.end();
}

cleanDummyUsers().catch(err => {
  console.error('Error cleaning dummy users:', err);
  process.exit(1);
});
