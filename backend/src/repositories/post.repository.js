const pool = require('../db');

/**
 * Repository handling database operations for business posts and interactions (likes/comments).
 */
class PostRepository {
  /**
   * Creates a new business post.
   * @param {object} param0 
   * @returns {Promise<object>}
   */
  async create({ businessId, authorUserId, content }) {
    const [result] = await pool.query(
      `INSERT INTO posts (business_id, author_user_id, content, like_count)
       VALUES (?, ?, ?, 0)`,
      [businessId, authorUserId, content]
    );

    return this.findById(result.insertId);
  }

  /**
   * Finds a post by ID with business and author details.
   * @param {number|string} postId 
   * @returns {Promise<object|null>}
   */
  async findById(postId) {
    const [rows] = await pool.query(
      `SELECT 
         p.post_id,
         p.business_id,
         p.author_user_id,
         p.content,
         p.like_count,
         p.created_at,
         b.name AS business_name,
         b.slug AS business_slug,
         b.city AS business_city,
         b.state AS business_state,
         b.status AS business_status,
         u.full_name AS author_name,
         u.avatar_url AS author_avatar_url
       FROM posts p
       JOIN businesses b ON p.business_id = b.business_id
       JOIN users u ON p.author_user_id = u.user_id
       WHERE p.post_id = ?`,
      [postId]
    );

    return rows[0] || null;
  }

  /**
   * Lists posts feed with pagination and optional business filter.
   * @param {object} options 
   * @returns {Promise<Array>}
   */
  async listFeed({ businessId = null, page = 1, pageSize = 20 } = {}) {
    let whereClause = "b.status IN ('ACTIVE', 'VERIFIED')";
    const params = [];

    if (businessId) {
      whereClause += ' AND p.business_id = ?';
      params.push(businessId);
    }

    const limit = parseInt(pageSize, 10) || 20;
    const offset = ((parseInt(page, 10) || 1) - 1) * limit;

    const [rows] = await pool.query(
      `SELECT 
         p.post_id,
         p.business_id,
         p.author_user_id,
         p.content,
         p.like_count,
         p.created_at,
         b.name AS business_name,
         b.slug AS business_slug,
         b.city AS business_city,
         b.state AS business_state,
         u.full_name AS author_name,
         u.avatar_url AS author_avatar_url
       FROM posts p
       JOIN businesses b ON p.business_id = b.business_id
       JOIN users u ON p.author_user_id = u.user_id
       WHERE ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return rows;
  }

  /**
   * Finds a user's LIKE interaction on a post.
   * @param {number|string} postId 
   * @param {number|string} userId 
   * @returns {Promise<object|null>}
   */
  async findUserLike(postId, userId) {
    const [rows] = await pool.query(
      `SELECT interaction_id, post_id, user_id, interaction_type, created_at
       FROM post_interactions
       WHERE post_id = ? AND user_id = ? AND interaction_type = 'LIKE'`,
      [postId, userId]
    );

    return rows[0] || null;
  }

  /**
   * Adds an interaction (LIKE or COMMENT).
   * @param {object} param0 
   * @returns {Promise<object>}
   */
  async addInteraction({ postId, userId, interactionType, body = null }) {
    const [result] = await pool.query(
      `INSERT INTO post_interactions (post_id, user_id, interaction_type, body)
       VALUES (?, ?, ?, ?)`,
      [postId, userId, interactionType, body]
    );

    return {
      interaction_id: result.insertId,
      post_id: postId,
      user_id: userId,
      interaction_type: interactionType,
      body,
      created_at: new Date()
    };
  }

  /**
   * Deletes an interaction by ID.
   * @param {number|string} interactionId 
   */
  async deleteInteraction(interactionId) {
    await pool.query(
      `DELETE FROM post_interactions WHERE interaction_id = ?`,
      [interactionId]
    );
  }

  /**
   * Updates the like_count on a post.
   * @param {number|string} postId 
   * @param {number} delta 
   */
  async updateLikeCount(postId, delta) {
    await pool.query(
      `UPDATE posts 
       SET like_count = GREATEST(0, COALESCE(like_count, 0) + ?)
       WHERE post_id = ?`,
      [delta, postId]
    );
  }

  /**
   * Lists interactions for a post with author details.
   * @param {number|string} postId 
   * @param {object} options 
   * @returns {Promise<Array>}
   */
  async listInteractions(postId, { interactionType = null, page = 1, pageSize = 50 } = {}) {
    let whereClause = 'pi.post_id = ?';
    const params = [postId];

    if (interactionType) {
      whereClause += ' AND pi.interaction_type = ?';
      params.push(interactionType);
    }

    const limit = parseInt(pageSize, 10) || 50;
    const offset = ((parseInt(page, 10) || 1) - 1) * limit;

    const [rows] = await pool.query(
      `SELECT 
         pi.interaction_id,
         pi.post_id,
         pi.user_id,
         pi.interaction_type,
         pi.body,
         pi.created_at,
         u.full_name AS user_name,
         u.avatar_url AS user_avatar_url
       FROM post_interactions pi
       JOIN users u ON pi.user_id = u.user_id
       WHERE ${whereClause}
       ORDER BY pi.created_at ASC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return rows;
  }
}

module.exports = new PostRepository();
