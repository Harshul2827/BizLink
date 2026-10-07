const pool = require('../db');

/**
 * Repository handling database operations for business reviews.
 */
class ReviewRepository {
  /**
   * Creates a new review.
   * @param {object} param0 
   * @returns {Promise<object>}
   */
  async create({ reviewerBusinessId, reviewedBusinessId, collaborationId = null, authorUserId, rating, title = null }) {
    const [result] = await pool.query(
      `INSERT INTO reviews (reviewer_business_id, reviewed_business_id, collaboration_id, author_user_id, rating, title)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [reviewerBusinessId, reviewedBusinessId, collaborationId, authorUserId, rating, title]
    );

    return this.findById(result.insertId);
  }

  /**
   * Finds a review by ID.
   * @param {number|string} reviewId 
   * @returns {Promise<object|null>}
   */
  async findById(reviewId) {
    const [rows] = await pool.query(
      `SELECT 
         r.review_id,
         r.reviewer_business_id,
         r.reviewed_business_id,
         r.collaboration_id,
         r.author_user_id,
         r.rating,
         r.title,
         r.created_at,
         reviewer.name AS reviewer_business_name,
         reviewer.slug AS reviewer_business_slug,
         reviewed.name AS reviewed_business_name,
         reviewed.slug AS reviewed_business_slug,
         u.full_name AS author_name,
         u.avatar_url AS author_avatar_url
       FROM reviews r
       JOIN businesses reviewer ON r.reviewer_business_id = reviewer.business_id
       JOIN businesses reviewed ON r.reviewed_business_id = reviewed.business_id
       JOIN users u ON r.author_user_id = u.user_id
       WHERE r.review_id = ?`,
      [reviewId]
    );
    return rows[0] || null;
  }

  /**
   * Checks if a review already exists for a collaboration from a specific reviewer business.
   * @param {number|string} collaborationId 
   * @param {number|string} reviewerBusinessId 
   * @returns {Promise<object|null>}
   */
  async findByCollaborationAndReviewer(collaborationId, reviewerBusinessId) {
    const [rows] = await pool.query(
      `SELECT review_id, reviewer_business_id, reviewed_business_id, collaboration_id, rating
       FROM reviews
       WHERE collaboration_id = ? AND reviewer_business_id = ?`,
      [collaborationId, reviewerBusinessId]
    );
    return rows[0] || null;
  }

  /**
   * Lists reviews received by a business with pagination.
   * @param {number|string} businessId 
   * @param {object} options 
   * @returns {Promise<Array>}
   */
  async listForBusiness(businessId, { page = 1, pageSize = 20 } = {}) {
    const limit = parseInt(pageSize, 10) || 20;
    const offset = ((parseInt(page, 10) || 1) - 1) * limit;

    const [rows] = await pool.query(
      `SELECT 
         r.review_id,
         r.reviewer_business_id,
         r.reviewed_business_id,
         r.collaboration_id,
         r.author_user_id,
         r.rating,
         r.title,
         r.created_at,
         reviewer.name AS reviewer_business_name,
         reviewer.slug AS reviewer_business_slug,
         reviewer.city AS reviewer_city,
         reviewer.state AS reviewer_state,
         u.full_name AS author_name,
         u.avatar_url AS author_avatar_url
       FROM reviews r
       JOIN businesses reviewer ON r.reviewer_business_id = reviewer.business_id
       JOIN users u ON r.author_user_id = u.user_id
       WHERE r.reviewed_business_id = ?
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [businessId, limit, offset]
    );

    return rows;
  }

  /**
   * Computes aggregate rating stats for a business.
   * @param {number|string} businessId 
   * @returns {Promise<{ averageRating: number, totalReviews: number }>}
   */
  async getBusinessRatingStats(businessId) {
    const [rows] = await pool.query(
      `SELECT 
         COUNT(*) AS total_reviews,
         COALESCE(AVG(rating), 0) AS average_rating
       FROM reviews
       WHERE reviewed_business_id = ?`,
      [businessId]
    );

    return {
      totalReviews: parseInt(rows[0].total_reviews, 10) || 0,
      averageRating: parseFloat(Number(rows[0].average_rating).toFixed(2))
    };
  }
}

module.exports = new ReviewRepository();
