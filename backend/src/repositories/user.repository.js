const pool = require('../db');

/**
 * Repository handling direct MySQL access for the 'users' table and user-associated data.
 */
class UserRepository {
  /**
   * Finds a user by email.
   * @param {string} email 
   * @returns {Promise<object|null>}
   */
  async findByEmail(email) {
    const normalizedEmail = email ? email.toLowerCase().trim() : '';
    const [rows] = await pool.query(
      `SELECT user_id, email, phone, password_hash, full_name, avatar_url, role, status,
              COALESCE(email_verified, 0) AS email_verified, email_verified_at,
              last_login_at, created_at, updated_at
       FROM users 
       WHERE email = ?`,
      [normalizedEmail]
    );
    if (!rows[0]) return null;
    return {
      ...rows[0],
      email_verified: Boolean(rows[0].email_verified)
    };
  }

  /**
   * Finds a user by primary key ID.
   * @param {number|string} userId 
   * @returns {Promise<object|null>}
   */
  async findById(userId) {
    const [rows] = await pool.query(
      `SELECT user_id, email, phone, password_hash, full_name, avatar_url, role, status,
              COALESCE(email_verified, 0) AS email_verified, email_verified_at,
              last_login_at, created_at, updated_at
       FROM users 
       WHERE user_id = ?`,
      [userId]
    );
    if (!rows[0]) return null;
    return {
      ...rows[0],
      email_verified: Boolean(rows[0].email_verified)
    };
  }

  /**
   * Finds a user by phone number.
   * @param {string} phone 
   * @returns {Promise<object|null>}
   */
  async findByPhone(phone) {
    if (!phone) return null;
    const [rows] = await pool.query(
      `SELECT user_id, email, phone, full_name, role, status,
              COALESCE(email_verified, 0) AS email_verified, email_verified_at
       FROM users 
       WHERE phone = ?`,
      [phone]
    );
    if (!rows[0]) return null;
    return {
      ...rows[0],
      email_verified: Boolean(rows[0].email_verified)
    };
  }

  /**
   * Creates a new user record in unverified state (email_verified = FALSE).
   * @param {object} param0 
   * @returns {Promise<object>} Created user record
   */
  async create({ email, phone = null, passwordHash, fullName, role = 'OWNER', avatarUrl = null, emailVerified = false }) {
    const normalizedEmail = email.toLowerCase().trim();
    const [result] = await pool.query(
      `INSERT INTO users (email, phone, password_hash, full_name, role, avatar_url, email_verified, last_login_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [normalizedEmail, phone, passwordHash, fullName, role, avatarUrl, emailVerified ? 1 : 0]
    );

    return {
      user_id: result.insertId,
      email: normalizedEmail,
      phone,
      full_name: fullName,
      role,
      status: 'ACTIVE',
      email_verified: emailVerified,
      avatar_url: avatarUrl,
      last_login_at: new Date()
    };
  }

  /**
   * Marks a user's email as verified.
   * @param {number|string} userId 
   */
  async markEmailVerified(userId) {
    await pool.query(
      `UPDATE users 
       SET email_verified = 1, email_verified_at = NOW() 
       WHERE user_id = ?`,
      [userId]
    );
  }

  /**
   * Updates user's last login timestamp.
   * @param {number|string} userId 
   */
  async updateLastLogin(userId) {
    await pool.query(
      `UPDATE users SET last_login_at = NOW() WHERE user_id = ?`,
      [userId]
    );
  }

  /**
   * Updates user's password hash.
   * @param {number|string} userId 
   * @param {string} passwordHash 
   */
  async updatePassword(userId, passwordHash) {
    await pool.query(
      `UPDATE users SET password_hash = ? WHERE user_id = ?`,
      [passwordHash, userId]
    );
  }

  /**
   * Updates user profile fields.
   * @param {number|string} userId 
   * @param {object} updates 
   */
  async updateProfile(userId, { fullName, phone, avatarUrl }) {
    await pool.query(
      `UPDATE users 
       SET full_name = COALESCE(?, full_name),
           phone = COALESCE(?, phone),
           avatar_url = COALESCE(?, avatar_url)
       WHERE user_id = ?`,
      [fullName, phone, avatarUrl, userId]
    );

    return this.findById(userId);
  }

  /**
   * Retrieves business memberships and owned businesses for a given user.
   * @param {number|string} userId 
   * @returns {Promise<Array>}
   */
  async getUserBusinesses(userId) {
    const [rows] = await pool.query(
      `SELECT 
         b.business_id,
         b.name,
         b.slug,
         b.status,
         b.city,
         b.state,
         b.country,
         CASE 
           WHEN b.owner_user_id = ? THEN 'OWNER'
           ELSE bm.member_role 
         END AS user_business_role
       FROM businesses b
       LEFT JOIN business_members bm ON b.business_id = bm.business_id AND bm.user_id = ?
       WHERE b.owner_user_id = ? OR bm.user_id = ?`,
      [userId, userId, userId, userId]
    );
    return rows;
  }
}

module.exports = new UserRepository();
