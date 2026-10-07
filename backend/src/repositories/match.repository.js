const pool = require('../db');

class MatchRepository {
  /**
   * Retrieves a need along with its posting business information.
   */
  async getNeedWithBusiness(needId) {
    const [rows] = await pool.query(
      `SELECT 
         n.need_id,
         n.business_id,
         n.category_id,
         n.title,
         n.budget_min,
         n.budget_max,
         n.deadline,
         b.name AS business_name,
         b.city AS business_city,
         b.state AS business_state,
         b.country AS business_country,
         b.status AS business_status
       FROM needs n
       JOIN businesses b ON n.business_id = b.business_id
       WHERE n.need_id = ?`,
      [needId]
    );
    return rows[0] || null;
  }

  /**
   * Retrieves candidate active services from other businesses to match against a need.
   */
  async getCandidateServicesForNeed(needBusinessId) {
    const [rows] = await pool.query(
      `SELECT 
         s.service_id,
         s.business_id,
         s.category_id,
         s.title,
         s.price_min,
         s.price_max,
         s.status,
         b.name AS business_name,
         b.slug AS business_slug,
         b.city AS business_city,
         b.state AS business_state,
         b.country AS business_country,
         b.status AS business_status
       FROM services s
       JOIN businesses b ON s.business_id = b.business_id
       WHERE s.status = 'ACTIVE' 
         AND b.status IN ('ACTIVE', 'VERIFIED')
         AND s.business_id != ?`,
      [needBusinessId]
    );
    return rows;
  }

  /**
   * Retrieves candidate active needs from other businesses to match against a service.
   */
  async getCandidateNeedsForService(serviceBusinessId) {
    const [rows] = await pool.query(
      `SELECT 
         n.need_id,
         n.business_id,
         n.category_id,
         n.title,
         n.budget_min,
         n.budget_max,
         n.deadline,
         b.name AS business_name,
         b.slug AS business_slug,
         b.city AS business_city,
         b.state AS business_state,
         b.country AS business_country,
         b.status AS business_status
       FROM needs n
       JOIN businesses b ON n.business_id = b.business_id
       WHERE b.status IN ('ACTIVE', 'VERIFIED')
         AND n.business_id != ?`,
      [serviceBusinessId]
    );
    return rows;
  }

  /**
   * Retrieves a service along with its offering business information.
   */
  async getServiceWithBusiness(serviceId) {
    const [rows] = await pool.query(
      `SELECT 
         s.service_id,
         s.business_id,
         s.category_id,
         s.title,
         s.price_min,
         s.price_max,
         s.status,
         b.name AS business_name,
         b.city AS business_city,
         b.state AS business_state,
         b.country AS business_country,
         b.status AS business_status
       FROM services s
       JOIN businesses b ON s.business_id = b.business_id
       WHERE s.service_id = ?`,
      [serviceId]
    );
    return rows[0] || null;
  }

  /**
   * Persists or updates computed matches in the database.
   */
  async saveMatches(matchesList) {
    if (!matchesList || matchesList.length === 0) return;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      for (const m of matchesList) {
        // Check if existing match exists between need and service
        const [existing] = await connection.query(
          'SELECT match_id FROM matches WHERE need_id = ? AND service_id = ?',
          [m.needId, m.serviceId]
        );

        if (existing.length > 0) {
          await connection.query(
            'UPDATE matches SET score = ?, generated_at = CURRENT_TIMESTAMP WHERE match_id = ?',
            [m.score, existing[0].match_id]
          );
        } else {
          await connection.query(
            'INSERT INTO matches (need_id, service_id, score, generated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
            [m.needId, m.serviceId, m.score]
          );
        }
      }
      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  /**
   * Retrieves all needs owned by a specific business.
   */
  async getNeedsByBusinessId(businessId) {
    const [rows] = await pool.query(
      `SELECT 
         n.need_id,
         n.business_id,
         n.category_id,
         n.title,
         n.budget_min,
         n.budget_max,
         n.deadline,
         b.name AS business_name,
         b.city AS business_city,
         b.state AS business_state,
         b.country AS business_country,
         b.status AS business_status
       FROM needs n
       JOIN businesses b ON n.business_id = b.business_id
       WHERE n.business_id = ?`,
      [businessId]
    );
    return rows;
  }
}

module.exports = new MatchRepository();
