const pool = require('../db');

/**
 * Repository providing curated, current-state analytical queries and reporting validation checks.
 */
class AnalyticsRepository {
  /**
   * Retrieves high-level platform summary KPIs.
   */
  async getPlatformOverview() {
    const [counts] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM businesses WHERE status != 'SUSPENDED') AS total_active_businesses,
        (SELECT COUNT(*) FROM businesses WHERE status = 'VERIFIED') AS total_verified_businesses,
        (SELECT COUNT(*) FROM users WHERE status = 'ACTIVE') AS total_active_users,
        (SELECT COUNT(*) FROM services WHERE status = 'ACTIVE') AS total_active_services,
        (SELECT COUNT(*) FROM needs) AS total_needs,
        (SELECT COUNT(*) FROM connections WHERE status = 'ACCEPTED') AS total_active_connections,
        (SELECT COUNT(*) FROM collaborations WHERE status = 'ACTIVE') AS active_collaborations,
        (SELECT COUNT(*) FROM collaborations WHERE status = 'COMPLETED') AS completed_collaborations,
        (SELECT COUNT(*) FROM reviews) AS total_reviews,
        (SELECT COALESCE(ROUND(AVG(rating), 2), 0) FROM reviews) AS average_review_rating
    `);

    return counts[0];
  }

  /**
   * Retrieves business counts grouped by primary category.
   */
  async getBusinessesByCategory() {
    const [rows] = await pool.query(`
      SELECT 
        COALESCE(c.name, 'Uncategorized') AS category_name,
        c.slug AS category_slug,
        COUNT(b.business_id) AS business_count
      FROM businesses b
      LEFT JOIN categories c ON b.primary_category_id = c.category_id
      WHERE b.status != 'SUSPENDED'
      GROUP BY c.category_id, c.name, c.slug
      ORDER BY business_count DESC
    `);
    return rows;
  }

  /**
   * Retrieves business distribution by geographic location (State / Country).
   */
  async getBusinessesByLocation() {
    const [rows] = await pool.query(`
      SELECT 
        COALESCE(state, 'Unknown') AS state,
        COALESCE(country, 'Unknown') AS country,
        COUNT(business_id) AS business_count
      FROM businesses
      WHERE status != 'SUSPENDED'
      GROUP BY country, state
      ORDER BY business_count DESC
    `);
    return rows;
  }

  /**
   * Retrieves collaboration breakdown by status and duration statistics.
   */
  async getCollaborationMetrics() {
    const [statusRows] = await pool.query(`
      SELECT 
        status,
        COUNT(*) AS count
      FROM collaborations
      GROUP BY status
    `);

    const [durationRows] = await pool.query(`
      SELECT 
        COUNT(*) AS completed_count,
        ROUND(AVG(DATEDIFF(COALESCE(end_date, CURRENT_DATE), start_date)), 1) AS avg_duration_days
      FROM collaborations
      WHERE status = 'COMPLETED' AND start_date IS NOT NULL
    `);

    return {
      status_breakdown: statusRows,
      completed_metrics: durationRows[0] || { completed_count: 0, avg_duration_days: null }
    };
  }

  /**
   * Retrieves rating distribution and verification status counts for trust reporting.
   */
  async getTrustMetrics() {
    const [ratings] = await pool.query(`
      SELECT 
        rating,
        COUNT(*) AS review_count
      FROM reviews
      GROUP BY rating
      ORDER BY rating DESC
    `);

    const [verification] = await pool.query(`
      SELECT 
        status,
        COUNT(*) AS count
      FROM businesses
      GROUP BY status
    `);

    return {
      ratings_distribution: ratings,
      verification_status: verification
    };
  }

  /**
   * Retrieves monthly platform growth statistics for businesses, users, and collaborations.
   */
  async getGrowthTrends() {
    const [businessGrowth] = await pool.query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') AS month,
        COUNT(*) AS new_businesses
      FROM businesses
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month ASC
      LIMIT 12
    `);

    const [userGrowth] = await pool.query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') AS month,
        COUNT(*) AS new_users
      FROM users
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month ASC
      LIMIT 12
    `);

    return {
      businesses: businessGrowth,
      users: userGrowth
    };
  }

  /**
   * Data cleaning & reporting integrity check.
   * Identifies orphaned records, invalid foreign keys, or incomplete records.
   */
  async runDataIntegrityAudit() {
    const [orphanServices] = await pool.query(`
      SELECT COUNT(*) AS count 
      FROM services s 
      LEFT JOIN businesses b ON s.business_id = b.business_id 
      WHERE b.business_id IS NULL
    `);

    const [orphanNeeds] = await pool.query(`
      SELECT COUNT(*) AS count 
      FROM needs n 
      LEFT JOIN businesses b ON n.business_id = b.business_id 
      WHERE b.business_id IS NULL
    `);

    const [unverifiedActive] = await pool.query(`
      SELECT COUNT(*) AS count 
      FROM businesses 
      WHERE status = 'UNVERIFIED'
    `);

    return {
      timestamp: new Date().toISOString(),
      integrity_status: orphanServices[0].count === 0 && orphanNeeds[0].count === 0 ? 'HEALTHY' : 'NEEDS_CLEANING',
      audit_results: {
        orphan_services: orphanServices[0].count,
        orphan_needs: orphanNeeds[0].count,
        unverified_businesses: unverifiedActive[0].count
      }
    };
  }
}

module.exports = new AnalyticsRepository();
