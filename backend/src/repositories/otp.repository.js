const pool = require('../db');

class OtpRepository {
  /**
   * Invalidates any prior active OTPs for the given email & purpose, then inserts a new OTP record.
   */
  async create({ userId, email, otpHash, purpose, expiresInMinutes = 10, maxAttempts = 5 }) {
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Invalidate any prior active OTPs for this email & purpose
    await pool.query(
      `UPDATE user_otps 
       SET consumed_at = NOW() 
       WHERE email = ? AND purpose = ? AND consumed_at IS NULL`,
      [normalizedEmail, purpose]
    );

    // 2. Insert new OTP record with clean expiry timestamp
    const [result] = await pool.query(
      `INSERT INTO user_otps (user_id, email, otp_hash, purpose, attempts, max_attempts, expires_at, created_at)
       VALUES (?, ?, ?, ?, 0, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE), NOW())`,
      [userId, normalizedEmail, otpHash, purpose, maxAttempts, expiresInMinutes]
    );

    return this.findById(result.insertId);
  }

  /**
   * Finds an OTP record by its primary key.
   */
  async findById(otpId) {
    const [rows] = await pool.query(
      `SELECT otp_id, user_id, email, otp_hash, purpose, attempts, max_attempts, expires_at, consumed_at, created_at,
              TIMESTAMPDIFF(SECOND, created_at, NOW()) AS age_seconds,
              TIMESTAMPDIFF(SECOND, NOW(), expires_at) AS remaining_seconds
       FROM user_otps
       WHERE otp_id = ?`,
      [otpId]
    );
    return rows[0] || null;
  }

  /**
   * Finds the latest unconsumed OTP record for a given email and purpose.
   */
  async findLatestActive(email, purpose) {
    const normalizedEmail = email.toLowerCase().trim();
    const [rows] = await pool.query(
      `SELECT otp_id, user_id, email, otp_hash, purpose, attempts, max_attempts, expires_at, consumed_at, created_at,
              TIMESTAMPDIFF(SECOND, created_at, NOW()) AS age_seconds,
              TIMESTAMPDIFF(SECOND, NOW(), expires_at) AS remaining_seconds
       FROM user_otps
       WHERE email = ? AND purpose = ? AND consumed_at IS NULL
       ORDER BY created_at DESC 
       LIMIT 1`,
      [normalizedEmail, purpose]
    );
    return rows[0] || null;
  }

  /**
   * Increments the failed attempts counter for a given OTP.
   */
  async incrementAttempts(otpId) {
    await pool.query(
      `UPDATE user_otps SET attempts = attempts + 1 WHERE otp_id = ?`,
      [otpId]
    );
  }

  /**
   * Marks an OTP record as consumed upon successful verification.
   */
  async markConsumed(otpId) {
    await pool.query(
      `UPDATE user_otps SET consumed_at = NOW() WHERE otp_id = ?`,
      [otpId]
    );
  }

  /**
   * Periodic garbage collection of old OTP records.
   */
  async cleanupOldRecords(daysOld = 7) {
    await pool.query(
      `DELETE FROM user_otps WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [daysOld]
    );
  }
}

module.exports = new OtpRepository();

