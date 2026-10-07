const pool = require('../db');

/**
 * Repository handling database operations for reports and administrative moderation.
 */
class ReportRepository {
  /**
   * Creates a new user report.
   * @param {object} param0 
   * @returns {Promise<object>}
   */
  async create({ reporterUserId, targetType, targetId, reason }) {
    const [result] = await pool.query(
      `INSERT INTO reports (reporter_user_id, target_type, target_id, reason, status)
       VALUES (?, ?, ?, ?, 'OPEN')`,
      [reporterUserId, targetType, targetId, reason]
    );

    return this.findById(result.insertId);
  }

  /**
   * Finds a report by ID with reporter and admin details.
   * @param {number|string} reportId 
   * @returns {Promise<object|null>}
   */
  async findById(reportId) {
    const [rows] = await pool.query(
      `SELECT 
         r.report_id,
         r.reporter_user_id,
         r.admin_user_id,
         r.target_type,
         r.target_id,
         r.reason,
         r.status,
         r.created_at,
         rep.full_name AS reporter_name,
         rep.email AS reporter_email,
         adm.full_name AS admin_name
       FROM reports r
       JOIN users rep ON r.reporter_user_id = rep.user_id
       LEFT JOIN users adm ON r.admin_user_id = adm.user_id
       WHERE r.report_id = ?`,
      [reportId]
    );

    return rows[0] || null;
  }

  /**
   * Lists reports with optional status and target_type filters.
   * @param {object} options 
   * @returns {Promise<Array>}
   */
  async listReports({ status = null, targetType = null, page = 1, pageSize = 20 } = {}) {
    let whereClause = '1=1';
    const params = [];

    if (status) {
      whereClause += ' AND r.status = ?';
      params.push(status);
    }

    if (targetType) {
      whereClause += ' AND r.target_type = ?';
      params.push(targetType);
    }

    const limit = parseInt(pageSize, 10) || 20;
    const offset = ((parseInt(page, 10) || 1) - 1) * limit;

    const [rows] = await pool.query(
      `SELECT 
         r.report_id,
         r.reporter_user_id,
         r.admin_user_id,
         r.target_type,
         r.target_id,
         r.reason,
         r.status,
         r.created_at,
         rep.full_name AS reporter_name,
         rep.email AS reporter_email,
         adm.full_name AS admin_name
       FROM reports r
       JOIN users rep ON r.reporter_user_id = rep.user_id
       LEFT JOIN users adm ON r.admin_user_id = adm.user_id
       WHERE ${whereClause}
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return rows;
  }

  /**
   * Resolves a report by setting its status and admin_user_id.
   * @param {number|string} reportId 
   * @param {number|string} adminUserId 
   */
  async resolveReport(reportId, adminUserId) {
    await pool.query(
      `UPDATE reports 
       SET status = 'RESOLVED', admin_user_id = ?
       WHERE report_id = ?`,
      [adminUserId, reportId]
    );

    return this.findById(reportId);
  }

  /**
   * Updates business status (moderation/verification).
   * @param {number|string} businessId 
   * @param {string} status 
   */
  async updateBusinessStatus(businessId, status) {
    await pool.query(
      `UPDATE businesses SET status = ? WHERE business_id = ?`,
      [status, businessId]
    );
  }

  /**
   * Updates user status (moderation/suspension).
   * @param {number|string} userId 
   * @param {string} status 
   */
  async updateUserStatus(userId, status) {
    await pool.query(
      `UPDATE users SET status = ? WHERE user_id = ?`,
      [status, userId]
    );
  }
}

module.exports = new ReportRepository();
