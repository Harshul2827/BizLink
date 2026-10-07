const pool = require('../db');

/**
 * Repository handling database operations for business needs.
 */
class NeedRepository {
  /**
   * Creates a new business need.
   * @param {object} param0 
   * @returns {Promise<object>}
   */
  async create({ businessId, categoryId = null, title, budgetMin = null, budgetMax = null, deadline = null }) {
    const [result] = await pool.query(
      `INSERT INTO needs (business_id, category_id, title, budget_min, budget_max, deadline)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [businessId, categoryId, title, budgetMin, budgetMax, deadline]
    );

    return this.findById(result.insertId);
  }

  /**
   * Finds a need by its ID.
   * @param {number|string} needId 
   * @returns {Promise<object|null>}
   */
  async findById(needId) {
    const [rows] = await pool.query(
      `SELECT 
         n.need_id,
         n.business_id,
         n.category_id,
         n.title,
         n.budget_min,
         n.budget_max,
         n.deadline,
         c.name AS category_name,
         c.slug AS category_slug,
         b.name AS business_name,
         b.owner_user_id
       FROM needs n
       LEFT JOIN categories c ON n.category_id = c.category_id
       JOIN businesses b ON n.business_id = b.business_id
       WHERE n.need_id = ?`,
      [needId]
    );
    return rows[0] || null;
  }

  /**
   * Finds all needs for a specific business.
   * @param {number|string} businessId 
   * @returns {Promise<Array>}
   */
  async findByBusinessId(businessId) {
    const [rows] = await pool.query(
      `SELECT 
         n.need_id,
         n.business_id,
         n.category_id,
         n.title,
         n.budget_min,
         n.budget_max,
         n.deadline,
         c.name AS category_name,
         c.slug AS category_slug
       FROM needs n
       LEFT JOIN categories c ON n.category_id = c.category_id
       WHERE n.business_id = ?
       ORDER BY n.need_id DESC`,
      [businessId]
    );
    return rows;
  }

  /**
   * Updates a need record.
   * @param {number|string} needId 
   * @param {object} updates 
   */
  async update(needId, { title, categoryId, budgetMin, budgetMax, deadline }) {
    await pool.query(
      `UPDATE needs 
       SET title = COALESCE(?, title),
           category_id = COALESCE(?, category_id),
           budget_min = COALESCE(?, budget_min),
           budget_max = COALESCE(?, budget_max),
           deadline = COALESCE(?, deadline)
       WHERE need_id = ?`,
      [title, categoryId, budgetMin, budgetMax, deadline, needId]
    );

    return this.findById(needId);
  }

  /**
   * Deletes a need record.
   * @param {number|string} needId 
   * @returns {Promise<boolean>}
   */
  async delete(needId) {
    const [result] = await pool.query(
      `DELETE FROM needs WHERE need_id = ?`,
      [needId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = new NeedRepository();
