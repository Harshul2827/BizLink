const pool = require('../db');

/**
 * Repository handling database operations for business-to-business connections.
 */
class ConnectionRepository {
  /**
   * Creates a new connection request in PENDING state.
   * @param {object} param0 
   * @returns {Promise<object>}
   */
  async create({ requesterBusinessId, receiverBusinessId }) {
    const [result] = await pool.query(
      `INSERT INTO connections (requester_business_id, receiver_business_id, status)
       VALUES (?, ?, 'PENDING')`,
      [requesterBusinessId, receiverBusinessId]
    );

    return this.findById(result.insertId);
  }

  /**
   * Finds a connection by ID with joined business details.
   * @param {number|string} connectionId 
   * @returns {Promise<object|null>}
   */
  async findById(connectionId) {
    const [rows] = await pool.query(
      `SELECT 
         c.connection_id,
         c.requester_business_id,
         c.receiver_business_id,
         c.status,
         c.requested_at,
         req.name AS requester_business_name,
         req.slug AS requester_business_slug,
         req.city AS requester_city,
         req.state AS requester_state,
         req.owner_user_id AS requester_owner_id,
         rec.name AS receiver_business_name,
         rec.slug AS receiver_business_slug,
         rec.city AS receiver_city,
         rec.state AS receiver_state,
         rec.owner_user_id AS receiver_owner_id
       FROM connections c
       JOIN businesses req ON c.requester_business_id = req.business_id
       JOIN businesses rec ON c.receiver_business_id = rec.business_id
       WHERE c.connection_id = ?`,
      [connectionId]
    );
    return rows[0] || null;
  }

  /**
   * Finds an existing connection between two businesses (in either direction).
   * @param {number|string} businessIdA 
   * @param {number|string} businessIdB 
   * @returns {Promise<object|null>}
   */
  async findBetweenBusinesses(businessIdA, businessIdB) {
    const [rows] = await pool.query(
      `SELECT connection_id, requester_business_id, receiver_business_id, status, requested_at
       FROM connections
       WHERE (requester_business_id = ? AND receiver_business_id = ?)
          OR (requester_business_id = ? AND receiver_business_id = ?)`,
      [businessIdA, businessIdB, businessIdB, businessIdA]
    );
    return rows[0] || null;
  }

  /**
   * Lists connections for a given business with optional status filter.
   * @param {number|string} businessId 
   * @param {object} options 
   * @returns {Promise<Array>}
   */
  async listForBusiness(businessId, { status = null, direction = 'ALL', page = 1, pageSize = 20 } = {}) {
    let whereClause = '';
    const params = [];

    if (direction === 'SENT') {
      whereClause = 'c.requester_business_id = ?';
      params.push(businessId);
    } else if (direction === 'RECEIVED') {
      whereClause = 'c.receiver_business_id = ?';
      params.push(businessId);
    } else {
      whereClause = '(c.requester_business_id = ? OR c.receiver_business_id = ?)';
      params.push(businessId, businessId);
    }

    if (status) {
      whereClause += ' AND c.status = ?';
      params.push(status);
    }

    const limit = parseInt(pageSize, 10) || 20;
    const offset = ((parseInt(page, 10) || 1) - 1) * limit;

    const [rows] = await pool.query(
      `SELECT 
         c.connection_id,
         c.requester_business_id,
         c.receiver_business_id,
         c.status,
         c.requested_at,
         req.name AS requester_business_name,
         req.slug AS requester_business_slug,
         rec.name AS receiver_business_name,
         rec.slug AS receiver_business_slug
       FROM connections c
       JOIN businesses req ON c.requester_business_id = req.business_id
       JOIN businesses rec ON c.receiver_business_id = rec.business_id
       WHERE ${whereClause}
       ORDER BY c.requested_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return rows;
  }

  /**
   * Updates the status of a connection.
   * @param {number|string} connectionId 
   * @param {string} status 
   */
  async updateStatus(connectionId, status) {
    await pool.query(
      `UPDATE connections SET status = ? WHERE connection_id = ?`,
      [status, connectionId]
    );
    return this.findById(connectionId);
  }
}

module.exports = new ConnectionRepository();
