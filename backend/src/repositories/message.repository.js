const pool = require('../db');

/**
 * Repository handling database operations for messages and conversations.
 */
class MessageRepository {
  /**
   * Creates and stores a new message.
   * @param {object} param0 
   * @returns {Promise<object>}
   */
  async create({ connectionId, senderUserId, senderBusinessId, body }) {
    const [result] = await pool.query(
      `INSERT INTO messages (connection_id, sender_user_id, sender_business_id, body)
       VALUES (?, ?, ?, ?)`,
      [connectionId, senderUserId, senderBusinessId, body]
    );

    return this.findById(result.insertId);
  }

  /**
   * Finds a message by ID.
   * @param {number|string} messageId 
   * @returns {Promise<object|null>}
   */
  async findById(messageId) {
    const [rows] = await pool.query(
      `SELECT 
         m.message_id,
         m.connection_id,
         m.sender_user_id,
         m.sender_business_id,
         m.body,
         m.sent_at,
         u.full_name AS sender_name,
         u.avatar_url AS sender_avatar_url,
         b.name AS sender_business_name
       FROM messages m
       JOIN users u ON m.sender_user_id = u.user_id
       JOIN businesses b ON m.sender_business_id = b.business_id
       WHERE m.message_id = ?`,
      [messageId]
    );
    return rows[0] || null;
  }

  /**
   * Retrieves messages for a connection with pagination.
   * @param {number|string} connectionId 
   * @param {object} options 
   * @returns {Promise<Array>}
   */
  async findByConnectionId(connectionId, { page = 1, pageSize = 50 } = {}) {
    const limit = parseInt(pageSize, 10) || 50;
    const offset = ((parseInt(page, 10) || 1) - 1) * limit;

    const [rows] = await pool.query(
      `SELECT 
         m.message_id,
         m.connection_id,
         m.sender_user_id,
         m.sender_business_id,
         m.body,
         m.sent_at,
         u.full_name AS sender_name,
         u.avatar_url AS sender_avatar_url,
         b.name AS sender_business_name
       FROM messages m
       JOIN users u ON m.sender_user_id = u.user_id
       JOIN businesses b ON m.sender_business_id = b.business_id
       WHERE m.connection_id = ?
       ORDER BY m.sent_at ASC
       LIMIT ? OFFSET ?`,
      [connectionId, limit, offset]
    );
    return rows;
  }

  /**
   * Retrieves recent conversation threads for businesses owned or joined by a user.
   * @param {number|string} userId 
   * @returns {Promise<Array>}
   */
  async findConversationsForUser(userId) {
    const [rows] = await pool.query(
      `SELECT 
         c.connection_id,
         c.requester_business_id,
         c.receiver_business_id,
         c.status AS connection_status,
         req.name AS requester_name,
         rec.name AS receiver_name,
         latest.body AS last_message_body,
         latest.sent_at AS last_message_time,
         latest.sender_user_id AS last_sender_user_id
       FROM connections c
       JOIN businesses req ON c.requester_business_id = req.business_id
       JOIN businesses rec ON c.receiver_business_id = rec.business_id
       LEFT JOIN (
         SELECT m1.*
         FROM messages m1
         JOIN (
           SELECT connection_id, MAX(message_id) AS max_id
           FROM messages
           GROUP BY connection_id
         ) m2 ON m1.message_id = m2.max_id
       ) latest ON c.connection_id = latest.connection_id
       WHERE (c.status = 'ACCEPTED')
         AND (
           req.owner_user_id = ? 
           OR rec.owner_user_id = ?
           OR EXISTS (SELECT 1 FROM business_members bm WHERE bm.business_id = req.business_id AND bm.user_id = ?)
           OR EXISTS (SELECT 1 FROM business_members bm WHERE bm.business_id = rec.business_id AND bm.user_id = ?)
         )
       ORDER BY COALESCE(latest.sent_at, c.requested_at) DESC`,
      [userId, userId, userId, userId]
    );
    return rows;
  }
}

module.exports = new MessageRepository();
