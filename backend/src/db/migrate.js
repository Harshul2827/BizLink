require('dotenv').config();
const pool = require('./index');

/**
 * Ensures email verification columns and user_otps table exist in the database.
 * Completely idempotent and safe for repeated execution on both MySQL 5.7 and 8.0+.
 */
async function runMigrations() {
  try {
    const dbName = process.env.DB_NAME || 'bizlink';

    // 1. Check if email_verified column exists in users table
    const [cols] = await pool.query(
      `SELECT COLUMN_NAME 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME IN ('email_verified', 'email_verified_at')`,
      [dbName]
    );

    const existingCols = cols.map(c => c.COLUMN_NAME);

    if (!existingCols.includes('email_verified')) {
      await pool.query(
        `ALTER TABLE users ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT FALSE AFTER status`
      );
      // Grandfather preexisting accounts as verified so demo/existing users can log in
      await pool.query(
        `UPDATE users SET email_verified = TRUE, email_verified_at = NOW() WHERE email_verified = FALSE`
      );
      console.log(' Migration: Added email_verified column to users table');
    }

    if (!existingCols.includes('email_verified_at')) {
      await pool.query(
        `ALTER TABLE users ADD COLUMN email_verified_at DATETIME NULL AFTER email_verified`
      );
      console.log(' Migration: Added email_verified_at column to users table');
    }

    // 2. Create user_otps table if not exists
    await pool.query(
      `CREATE TABLE IF NOT EXISTS user_otps (
        otp_id BIGINT AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT NOT NULL,
        email VARCHAR(190) NOT NULL,
        otp_hash VARCHAR(255) NOT NULL,
        purpose ENUM('EMAIL_VERIFICATION', 'PASSWORD_RESET') NOT NULL,
        attempts INT NOT NULL DEFAULT 0,
        max_attempts INT NOT NULL DEFAULT 5,
        expires_at DATETIME NOT NULL,
        consumed_at DATETIME NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        INDEX idx_user_otps_email_purpose (email, purpose),
        INDEX idx_user_otps_expires (expires_at)
      )`
    );

    console.log(' Database schema verified (email_verified columns & user_otps table ready)');
  } catch (err) {
    console.error(' Database migration check error:', err.message);
  }
}

module.exports = { runMigrations };

if (require.main === module) {
  runMigrations().then(() => process.exit(0)).catch(() => process.exit(1));
}
