const reviewRepository = require('../repositories/review.repository');
const businessRepository = require('../repositories/business.repository');
const collaborationRepository = require('../repositories/collaboration.repository');
const pool = require('../db');
const {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
  ConflictError
} = require('../errors/AppError');

class ReviewService {
  /**
   * Creates a review for a business.
   * @param {number|string} userId 
   * @param {object} param1 
   */
  async createReview(userId, {
    reviewer_business_id,
    reviewed_business_id,
    collaboration_id = null,
    rating,
    title = null
  }) {
    if (Number(reviewer_business_id) === Number(reviewed_business_id)) {
      throw new BadRequestError('Businesses cannot review themselves', 'SELF_REVIEW_FORBIDDEN');
    }

    // 1. Verify caller has permission in reviewer business
    const membership = await businessRepository.getUserMembership(reviewer_business_id, userId);
    if (!membership || !membership.isMember) {
      throw new ForbiddenError('You do not have permission to author reviews on behalf of this business', 'FORBIDDEN_REVIEWER_ACCESS');
    }

    // 2. Verify businesses exist
    const [reviewerBusiness, reviewedBusiness] = await Promise.all([
      businessRepository.findById(reviewer_business_id),
      businessRepository.findById(reviewed_business_id)
    ]);

    if (!reviewerBusiness) {
      throw new NotFoundError('Reviewer business not found', 'REVIEWER_NOT_FOUND');
    }
    if (!reviewedBusiness) {
      throw new NotFoundError('Reviewed business not found', 'REVIEWED_NOT_FOUND');
    }

    // 3. If tied to a collaboration, verify eligibility
    if (collaboration_id) {
      const collaboration = await collaborationRepository.findById(collaboration_id);
      if (!collaboration) {
        throw new NotFoundError('Referenced collaboration not found', 'COLLABORATION_NOT_FOUND');
      }

      if (collaboration.status !== 'COMPLETED') {
        throw new BadRequestError('Reviews can only be submitted for COMPLETED collaborations', 'COLLABORATION_NOT_COMPLETED');
      }

      const participantIds = collaboration.participants.map(p => Number(p.business_id));
      if (!participantIds.includes(Number(reviewer_business_id)) || !participantIds.includes(Number(reviewed_business_id))) {
        throw new BadRequestError('Both businesses must be participants in the referenced collaboration', 'COLLABORATION_PARTICIPANT_MISMATCH');
      }

      const existingReview = await reviewRepository.findByCollaborationAndReviewer(collaboration_id, reviewer_business_id);
      if (existingReview) {
        throw new ConflictError('A review has already been submitted for this collaboration by your business', 'DUPLICATE_COLLABORATION_REVIEW');
      }
    }

    // 4. Create review
    const review = await reviewRepository.create({
      reviewerBusinessId: reviewer_business_id,
      reviewedBusinessId: reviewed_business_id,
      collaborationId: collaboration_id,
      authorUserId: userId,
      rating,
      title
    });

    // 5. Record activity event
    await pool.query(
      `INSERT INTO activity_events (user_id, business_id, event_type, metadata)
       VALUES (?, ?, 'REVIEW_CREATED', ?)`,
      [
        userId,
        reviewed_business_id,
        JSON.stringify({
          review_id: review.review_id,
          reviewer_business_id,
          rating
        })
      ]
    );

    return review;
  }

  /**
   * Retrieves reviews for a business including summary statistics.
   * @param {number|string} businessId 
   * @param {object} options 
   */
  async getBusinessReviews(businessId, { page = 1, pageSize = 20 } = {}) {
    const business = await businessRepository.findById(businessId);
    if (!business) {
      throw new NotFoundError('Business not found', 'BUSINESS_NOT_FOUND');
    }

    const [stats, reviews] = await Promise.all([
      reviewRepository.getBusinessRatingStats(businessId),
      reviewRepository.listForBusiness(businessId, { page, pageSize })
    ]);

    return {
      stats,
      reviews
    };
  }

  /**
   * Retrieves single review by ID.
   * @param {number|string} reviewId 
   */
  async getReviewById(reviewId) {
    const review = await reviewRepository.findById(reviewId);
    if (!review) {
      throw new NotFoundError('Review not found', 'REVIEW_NOT_FOUND');
    }
    return review;
  }
}

module.exports = new ReviewService();
