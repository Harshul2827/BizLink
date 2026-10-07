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
    const [rows] = await pool.query(
      `SELECT user_id, email, phone, password_hash, full_name, avatar_url, role, status, last_login_at, created_at, updated_at
       FROM users 
       WHERE email = ?`,
      [email]
    );
    return rows[0] || null;
  }

  /**
   * Finds a user by primary key ID.
   * @param {number|string} userId 
   * @returns {Promise<object|null>}
   */
  async findById(userId) {
    const [rows] = await pool.query(
      `SELECT user_id, email, phone, password_hash, full_name, avatar_url, role, status, last_login_at, created_at, updated_at
       FROM users 
       WHERE user_id = ?`,
      [userId]
    );
    return rows[0] || null;
  }

  /**
   * Finds a user by phone number.
   * @param {string} phone 
   * @returns {Promise<object|null>}
   */
  async findByPhone(phone) {
    if (!phone) return null;
    const [rows] = await pool.query(
      `SELECT user_id, email, phone, full_name, role, status 
       FROM users 
       WHERE phone = ?`,
      [phone]
    );
    return rows[0] || null;
  }

  /**
   * Creates a new user record.
   * @param {object} param0 
   * @returns {Promise<object>} Created user record without sensitive password hash
   */
  async create({ email, phone = null, passwordHash, fullName, role = 'OWNER', avatarUrl = null }) {
    const [result] = await pool.query(
      `INSERT INTO users (email, phone, password_hash, full_name, role, avatar_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [email, phone, passwordHash, fullName, role, avatarUrl]
    );

    return {
      user_id: result.insertId,
      email,
      phone,
      full_name: fullName,
      role,
      status: 'ACTIVE',
      avatar_url: avatarUrl
    };
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
