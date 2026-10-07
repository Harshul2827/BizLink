const pool = require('../db');

/**
 * Repository handling database operations for B2B collaborations and participants.
 */
class CollaborationRepository {
  /**
   * Creates a collaboration and adds initial participants inside a transaction.
   * @param {object} param0 
   * @param {object} [client] - Optional external database connection for transactions
   * @returns {Promise<object>}
   */
  async create({ initiatorBusinessId, needId = null, serviceId = null, title, status = 'REQUESTED', startDate = null, endDate = null, partnerBusinessIds = [] }, client = null) {
    const db = client || pool;

    const [result] = await db.query(
      `INSERT INTO collaborations (initiator_business_id, need_id, service_id, title, status, start_date, end_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [initiatorBusinessId, needId, serviceId, title, status, startDate, endDate]
    );

    const collaborationId = result.insertId;

    // Add initiator participant
    await db.query(
      `INSERT INTO collaboration_participants (collaboration_id, business_id, participant_role)
       VALUES (?, ?, 'INITIATOR')`,
      [collaborationId, initiatorBusinessId]
    );

    // Add partner participants
    for (const partnerId of partnerBusinessIds) {
      await db.query(
        `INSERT INTO collaboration_participants (collaboration_id, business_id, participant_role)
         VALUES (?, ?, 'PARTNER')`,
        [collaborationId, partnerId]
      );
    }

    return this.findById(collaborationId, client);
  }

  /**
   * Finds a collaboration by ID with full details and participants.
   * @param {number|string} collaborationId 
   * @param {object} [client] 
   * @returns {Promise<object|null>}
   */
  async findById(collaborationId, client = null) {
    const db = client || pool;

    const [rows] = await db.query(
      `SELECT 
         c.collaboration_id,
         c.initiator_business_id,
         c.need_id,
         c.service_id,
         c.title,
         c.status,
         c.start_date,
         c.end_date,
         b.name AS initiator_business_name,
         b.slug AS initiator_business_slug,
         n.title AS need_title,
         s.title AS service_title
       FROM collaborations c
       JOIN businesses b ON c.initiator_business_id = b.business_id
       LEFT JOIN needs n ON c.need_id = n.need_id
       LEFT JOIN services s ON c.service_id = s.service_id
       WHERE c.collaboration_id = ?`,
      [collaborationId]
    );

    if (!rows || rows.length === 0) {
      return null;
    }

    const collaboration = rows[0];

    // Fetch participants
    const [participants] = await db.query(
      `SELECT 
         cp.collaboration_id,
         cp.business_id,
         cp.participant_role,
         cp.joined_at,
         b.name AS business_name,
         b.slug AS business_slug,
         b.city,
         b.state,
         b.owner_user_id
       FROM collaboration_participants cp
       JOIN businesses b ON cp.business_id = b.business_id
       WHERE cp.collaboration_id = ?
       ORDER BY cp.participant_role ASC, cp.joined_at ASC`,
      [collaborationId]
    );

    collaboration.participants = participants;
    return collaboration;
  }

  /**
   * Lists collaborations for a given business with optional status filter.
   * @param {number|string} businessId 
   * @param {object} options 
   * @returns {Promise<Array>}
   */
  async listForBusiness(businessId, { status = null, page = 1, pageSize = 20 } = {}) {
    let whereClause = 'cp.business_id = ?';
    const params = [businessId];

    if (status) {
      whereClause += ' AND c.status = ?';
      params.push(status);
    }

    const limit = parseInt(pageSize, 10) || 20;
    const offset = ((parseInt(page, 10) || 1) - 1) * limit;

    const [rows] = await pool.query(
      `SELECT 
         c.collaboration_id,
         c.initiator_business_id,
         c.need_id,
         c.service_id,
         c.title,
         c.status,
         c.start_date,
         c.end_date,
         init_b.name AS initiator_business_name,
         init_b.slug AS initiator_business_slug,
         cp.participant_role
       FROM collaborations c
       JOIN collaboration_participants cp ON c.collaboration_id = cp.collaboration_id
       JOIN businesses init_b ON c.initiator_business_id = init_b.business_id
       WHERE ${whereClause}
       ORDER BY c.collaboration_id DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return rows;
  }

  /**
   * Updates collaboration status and dates.
   * @param {number|string} collaborationId 
   * @param {string} status 
   * @param {object} [dates]
   * @param {object} [client]
   */
  async updateStatus(collaborationId, status, { startDate = null, endDate = null } = {}, client = null) {
    const db = client || pool;
    let query = 'UPDATE collaborations SET status = ?';
    const params = [status];

    if (startDate !== null) {
      query += ', start_date = ?';
      params.push(startDate);
    }
    if (endDate !== null) {
      query += ', end_date = ?';
      params.push(endDate);
    }

    query += ' WHERE collaboration_id = ?';
    params.push(collaborationId);

    await db.query(query, params);
    return this.findById(collaborationId, client);
  }

  /**
   * Adds a participant to an existing collaboration.
   * @param {number|string} collaborationId 
   * @param {number|string} businessId 
   * @param {string} role 
   */
  async addParticipant(collaborationId, businessId, role = 'PARTNER') {
    await pool.query(
      `INSERT INTO collaboration_participants (collaboration_id, business_id, participant_role)
       VALUES (?, ?, ?)`,
      [collaborationId, businessId, role]
    );
  }

  /**
   * Checks if a business is a participant in a collaboration.
   * @param {number|string} collaborationId 
   * @param {number|string} businessId 
   * @returns {Promise<object|null>}
   */
  async getParticipant(collaborationId, businessId) {
    const [rows] = await pool.query(
      `SELECT collaboration_id, business_id, participant_role, joined_at
       FROM collaboration_participants
       WHERE collaboration_id = ? AND business_id = ?`,
      [collaborationId, businessId]
    );
    return rows[0] || null;
  }
}

module.exports = new CollaborationRepository();
