const pool = require('../db');

/**
 * Repository handling database operations for businesses and memberships.
 */
class BusinessRepository {
  /**
   * Creates a business within an ACID transaction, automatically enrolling the owner as an ADMIN member
   * and recording a BUSINESS_CREATED activity event.
   * @param {object} param0 
   * @returns {Promise<object>}
   */
  async createWithMembership({
    ownerUserId,
    name,
    slug,
    description = null,
    city = null,
    state = null,
    country = null,
    primaryCategoryId = null,
    status = 'UNVERIFIED'
  }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Insert business record
      const [bizResult] = await connection.query(
        `INSERT INTO businesses (owner_user_id, primary_category_id, name, slug, description, city, state, country, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [ownerUserId, primaryCategoryId, name, slug, description, city, state, country, status]
      );
      const businessId = bizResult.insertId;

      // 2. Add owner as ADMIN member in business_members
      await connection.query(
        `INSERT INTO business_members (business_id, user_id, member_role)
         VALUES (?, ?, 'ADMIN')`,
        [businessId, ownerUserId]
      );

      // 3. Record activity event
      await connection.query(
        `INSERT INTO activity_events (user_id, business_id, event_type, metadata)
         VALUES (?, ?, 'BUSINESS_CREATED', ?)`,
        [ownerUserId, businessId, JSON.stringify({ name, slug, status })]
      );

      await connection.commit();

      return {
        business_id: businessId,
        owner_user_id: ownerUserId,
        primary_category_id: primaryCategoryId,
        name,
        slug,
        description,
        city,
        state,
        country,
        status
      };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  /**
   * Finds a business by its ID along with owner and category details.
   * @param {number|string} businessId 
   * @returns {Promise<object|null>}
   */
  async findById(businessId) {
    const [rows] = await pool.query(
      `SELECT 
         b.business_id,
         b.owner_user_id,
         b.primary_category_id,
         b.name,
         b.slug,
         b.description,
         b.city,
         b.state,
         b.country,
         b.status,
         b.created_at,
         c.name AS primary_category_name,
         c.slug AS primary_category_slug,
         u.full_name AS owner_name,
         u.email AS owner_email,
         u.avatar_url AS owner_avatar_url
       FROM businesses b
       LEFT JOIN categories c ON b.primary_category_id = c.category_id
       LEFT JOIN users u ON b.owner_user_id = u.user_id
       WHERE b.business_id = ?`,
      [businessId]
    );
    return rows[0] || null;
  }

  /**
   * Finds a business by slug.
   * @param {string} slug 
   * @returns {Promise<object|null>}
   */
  async findBySlug(slug) {
    const [rows] = await pool.query(
      `SELECT 
         b.business_id,
         b.owner_user_id,
         b.primary_category_id,
         b.name,
         b.slug,
         b.description,
         b.city,
         b.state,
         b.country,
         b.status,
         b.created_at,
         c.name AS primary_category_name,
         c.slug AS primary_category_slug,
         u.full_name AS owner_name,
         u.email AS owner_email,
         u.avatar_url AS owner_avatar_url
       FROM businesses b
       LEFT JOIN categories c ON b.primary_category_id = c.category_id
       LEFT JOIN users u ON b.owner_user_id = u.user_id
       WHERE b.slug = ?`,
      [slug]
    );
    return rows[0] || null;
  }

  /**
   * Updates business profile fields.
   * @param {number|string} businessId 
   * @param {object} updates 
   */
  async update(businessId, { name, description, city, state, country, primaryCategoryId, status }) {
    await pool.query(
      `UPDATE businesses 
       SET name = COALESCE(?, name),
           description = COALESCE(?, description),
           city = COALESCE(?, city),
           state = COALESCE(?, state),
           country = COALESCE(?, country),
           primary_category_id = COALESCE(?, primary_category_id),
           status = COALESCE(?, status)
       WHERE business_id = ?`,
      [name, description, city, state, country, primaryCategoryId, status, businessId]
    );

    return this.findById(businessId);
  }

  /**
   * Checks a user's membership and permission role within a business.
   * @param {number|string} businessId 
   * @param {number|string} userId 
   * @returns {Promise<{ isOwner: boolean, memberRole: string|null }|null>}
   */
  async getUserMembership(businessId, userId) {
    const [bizRows] = await pool.query(
      `SELECT owner_user_id FROM businesses WHERE business_id = ?`,
      [businessId]
    );
    if (!bizRows.length) return null;

    const isOwner = bizRows[0].owner_user_id === userId;

    const [memberRows] = await pool.query(
      `SELECT member_role, joined_at 
       FROM business_members 
       WHERE business_id = ? AND user_id = ?`,
      [businessId, userId]
    );

    const memberRole = memberRows.length ? memberRows[0].member_role : (isOwner ? 'ADMIN' : null);

    return {
      isOwner,
      isMember: isOwner || memberRows.length > 0,
      memberRole
    };
  }

  /**
   * Lists all members of a business.
   * @param {number|string} businessId 
   * @returns {Promise<Array>}
   */
  async getMembers(businessId) {
    const [rows] = await pool.query(
      `SELECT 
         bm.business_id,
         bm.user_id,
         bm.member_role,
         bm.joined_at,
         u.full_name,
         u.email,
         u.avatar_url,
         u.status AS user_status,
         CASE WHEN b.owner_user_id = bm.user_id THEN 1 ELSE 0 END AS is_primary_owner
       FROM business_members bm
       JOIN users u ON bm.user_id = u.user_id
       JOIN businesses b ON bm.business_id = b.business_id
       WHERE bm.business_id = ?
       ORDER BY is_primary_owner DESC, bm.joined_at ASC`,
      [businessId]
    );
    return rows;
  }

  /**
   * Adds a user as a member to a business.
   * @param {number|string} businessId 
   * @param {number|string} userId 
   * @param {string} memberRole 'ADMIN' | 'STAFF'
   */
  async addMember(businessId, userId, memberRole = 'STAFF') {
    await pool.query(
      `INSERT INTO business_members (business_id, user_id, member_role)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE member_role = VALUES(member_role)`,
      [businessId, userId, memberRole]
    );

    const [rows] = await pool.query(
      `SELECT bm.business_id, bm.user_id, bm.member_role, bm.joined_at, u.full_name, u.email
       FROM business_members bm
       JOIN users u ON bm.user_id = u.user_id
       WHERE bm.business_id = ? AND bm.user_id = ?`,
      [businessId, userId]
    );
    return rows[0] || null;
  }

  /**
   * Removes a member from a business.
   * @param {number|string} businessId 
   * @param {number|string} userId 
   */
  async removeMember(businessId, userId) {
    const [result] = await pool.query(
      `DELETE FROM business_members 
       WHERE business_id = ? AND user_id = ?`,
      [businessId, userId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Finds businesses owned or joined by a user.
   * @param {number|string} userId 
   */
  async findUserBusinesses(userId) {
    const [rows] = await pool.query(
      `SELECT 
         b.business_id,
         b.owner_user_id,
         b.primary_category_id,
         b.name,
         b.slug,
         b.description,
         b.city,
         b.state,
         b.country,
         b.status,
         b.created_at,
         c.name AS primary_category_name,
         CASE 
           WHEN b.owner_user_id = ? THEN 'OWNER'
           ELSE bm.member_role 
         END AS membership_role
       FROM businesses b
       LEFT JOIN categories c ON b.primary_category_id = c.category_id
       LEFT JOIN business_members bm ON b.business_id = bm.business_id AND bm.user_id = ?
       WHERE b.owner_user_id = ? OR bm.user_id = ?
       ORDER BY b.created_at DESC`,
      [userId, userId, userId, userId]
    );
    return rows;
  }
}

module.exports = new BusinessRepository();
