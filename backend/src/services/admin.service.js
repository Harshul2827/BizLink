const reportRepository = require('../repositories/report.repository');
const businessRepository = require('../repositories/business.repository');
const userRepository = require('../repositories/user.repository');
const postRepository = require('../repositories/post.repository');
const reviewRepository = require('../repositories/review.repository');
const pool = require('../db');
const {
  NotFoundError,
  BadRequestError,
  ForbiddenError
} = require('../errors/AppError');

class AdminService {
  /**
   * Submits a new user report against supported entities (USER, BUSINESS, POST, REVIEW, MESSAGE).
   * @param {number|string} reporterUserId 
   * @param {object} param1 
   */
  async submitReport(reporterUserId, { target_type, target_id, reason }) {
    // 1. Verify that target entity exists
    if (target_type === 'USER') {
      if (Number(reporterUserId) === Number(target_id)) {
        throw new BadRequestError('You cannot report your own account', 'SELF_REPORT_FORBIDDEN');
      }
      const user = await userRepository.findById(target_id);
      if (!user) {
        throw new NotFoundError('Target user not found', 'USER_NOT_FOUND');
      }
    } else if (target_type === 'BUSINESS') {
      const business = await businessRepository.findById(target_id);
      if (!business) {
        throw new NotFoundError('Target business not found', 'BUSINESS_NOT_FOUND');
      }
    } else if (target_type === 'POST') {
      const post = await postRepository.findById(target_id);
      if (!post) {
        throw new NotFoundError('Target post not found', 'POST_NOT_FOUND');
      }
    } else if (target_type === 'REVIEW') {
      const review = await reviewRepository.findById(target_id);
      if (!review) {
        throw new NotFoundError('Target review not found', 'REVIEW_NOT_FOUND');
      }
    } else if (target_type === 'MESSAGE') {
      const [messages] = await pool.query(
        `SELECT message_id FROM messages WHERE message_id = ?`,
        [target_id]
      );
      if (!messages || messages.length === 0) {
        throw new NotFoundError('Target message not found', 'MESSAGE_NOT_FOUND');
      }
    }

    // 2. Create report
    const report = await reportRepository.create({
      reporterUserId,
      targetType: target_type,
      targetId: target_id,
      reason
    });

    // 3. Record activity event
    await pool.query(
      `INSERT INTO activity_events (user_id, event_type, metadata)
       VALUES (?, 'REPORT_SUBMITTED', ?)`,
      [
        reporterUserId,
        JSON.stringify({
          report_id: report.report_id,
          target_type,
          target_id
        })
      ]
    );

    return report;
  }

  /**
   * Lists reports for admin review.
   * @param {object} options 
   */
  async listReports(options) {
    return reportRepository.listReports(options);
  }

  /**
   * Resolves a report.
   * @param {number|string} adminUserId 
   * @param {number|string} reportId 
   */
  async resolveReport(adminUserId, reportId) {
    const report = await reportRepository.findById(reportId);
    if (!report) {
      throw new NotFoundError('Report not found', 'REPORT_NOT_FOUND');
    }

    const resolved = await reportRepository.resolveReport(reportId, adminUserId);

    // Record activity event
    await pool.query(
      `INSERT INTO activity_events (user_id, event_type, metadata)
       VALUES (?, 'REPORT_RESOLVED', ?)`,
      [
        adminUserId,
        JSON.stringify({
          report_id: reportId,
          admin_user_id: adminUserId
        })
      ]
    );

    return resolved;
  }

  /**
   * Moderates a business's status (VERIFIED, SUSPENDED, ACTIVE, UNVERIFIED).
   * @param {number|string} adminUserId 
   * @param {number|string} businessId 
   * @param {string} status 
   */
  async updateBusinessStatus(adminUserId, businessId, status) {
    const business = await businessRepository.findById(businessId);
    if (!business) {
      throw new NotFoundError('Business not found', 'BUSINESS_NOT_FOUND');
    }

    await reportRepository.updateBusinessStatus(businessId, status);

    // Record activity event
    await pool.query(
      `INSERT INTO activity_events (user_id, business_id, event_type, metadata)
       VALUES (?, ?, 'BUSINESS_STATUS_MODERATED', ?)`,
      [
        adminUserId,
        businessId,
        JSON.stringify({
          old_status: business.status,
          new_status: status,
          admin_user_id: adminUserId
        })
      ]
    );

    return businessRepository.findById(businessId);
  }

  /**
   * Moderates a user's account status (ACTIVE, SUSPENDED).
   * @param {number|string} adminUserId 
   * @param {number|string} targetUserId 
   * @param {string} status 
   */
  async updateUserStatus(adminUserId, targetUserId, status) {
    const user = await userRepository.findById(targetUserId);
    if (!user) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }

    await reportRepository.updateUserStatus(targetUserId, status);

    // Record activity event
    await pool.query(
      `INSERT INTO activity_events (user_id, event_type, metadata)
       VALUES (?, 'USER_STATUS_MODERATED', ?)`,
      [
        adminUserId,
        JSON.stringify({
          target_user_id: targetUserId,
          old_status: user.status,
          new_status: status,
          admin_user_id: adminUserId
        })
      ]
    );

    return userRepository.findById(targetUserId);
  }
}

module.exports = new AdminService();
