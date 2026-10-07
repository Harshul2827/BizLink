const pool = require('../db');

/**
 * Repository handling database operations for business services / offers.
 */
class ServiceRepository {
  /**
   * Creates a new service offering for a business.
   * @param {object} param0 
   * @returns {Promise<object>}
   */
  async create({ businessId, categoryId = null, title, priceMin = null, priceMax = null, status = 'ACTIVE' }) {
    const [result] = await pool.query(
      `INSERT INTO services (business_id, category_id, title, price_min, price_max, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [businessId, categoryId, title, priceMin, priceMax, status]
    );

    return this.findById(result.insertId);
  }

  /**
   * Finds a service by its ID.
   * @param {number|string} serviceId 
   * @returns {Promise<object|null>}
   */
  async findById(serviceId) {
    const [rows] = await pool.query(
      `SELECT 
         s.service_id,
         s.business_id,
         s.category_id,
         s.title,
         s.price_min,
         s.price_max,
         s.status,
         c.name AS category_name,
         c.slug AS category_slug,
         b.name AS business_name,
         b.owner_user_id
       FROM services s
       LEFT JOIN categories c ON s.category_id = c.category_id
       JOIN businesses b ON s.business_id = b.business_id
       WHERE s.service_id = ?`,
      [serviceId]
    );
    return rows[0] || null;
  }

  /**
   * Finds all services for a specific business.
   * @param {number|string} businessId 
   * @param {object} options 
   * @returns {Promise<Array>}
   */
  async findByBusinessId(businessId, { status = null } = {}) {
    let query = `
      SELECT 
        s.service_id,
        s.business_id,
        s.category_id,
        s.title,
        s.price_min,
        s.price_max,
        s.status,
        c.name AS category_name,
        c.slug AS category_slug
      FROM services s
      LEFT JOIN categories c ON s.category_id = c.category_id
      WHERE s.business_id = ?
    `;
    const params = [businessId];

    if (status) {
      query += ` AND s.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY s.service_id DESC`;

    const [rows] = await pool.query(query, params);
    return rows;
  }

  /**
   * Updates a service record.
   * @param {number|string} serviceId 
   * @param {object} updates 
   */
  async update(serviceId, { title, categoryId, priceMin, priceMax, status }) {
    await pool.query(
      `UPDATE services 
       SET title = COALESCE(?, title),
           category_id = COALESCE(?, category_id),
           price_min = COALESCE(?, price_min),
           price_max = COALESCE(?, price_max),
           status = COALESCE(?, status)
       WHERE service_id = ?`,
      [title, categoryId, priceMin, priceMax, status, serviceId]
    );

    return this.findById(serviceId);
  }

  /**
   * Deletes a service record.
   * @param {number|string} serviceId 
   * @returns {Promise<boolean>}
   */
  async delete(serviceId) {
    const [result] = await pool.query(
      `DELETE FROM services WHERE service_id = ?`,
      [serviceId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = new ServiceRepository();
