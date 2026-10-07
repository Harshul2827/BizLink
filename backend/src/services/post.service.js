const postRepository = require('../repositories/post.repository');
const businessRepository = require('../repositories/business.repository');
const pool = require('../db');
const {
  NotFoundError,
  BadRequestError,
  ForbiddenError
} = require('../errors/AppError');

class PostService {
  /**
   * Creates a new business post.
   * @param {number|string} userId 
   * @param {object} param1 
   */
  async createPost(userId, { business_id, content }) {
    // 1. Verify business exists
    const business = await businessRepository.findById(business_id);
    if (!business) {
      throw new NotFoundError('Business not found', 'BUSINESS_NOT_FOUND');
    }

    if (business.status === 'SUSPENDED') {
      throw new ForbiddenError('Suspended businesses cannot create posts', 'BUSINESS_SUSPENDED');
    }

    // 2. Verify caller has membership in the business
    const membership = await businessRepository.getUserMembership(business_id, userId);
    if (!membership || !membership.isMember) {
      throw new ForbiddenError('You do not have permission to post for this business', 'FORBIDDEN_BUSINESS_ACCESS');
    }

    // 3. Create post
    const post = await postRepository.create({
      businessId: business_id,
      authorUserId: userId,
      content
    });

    // 4. Record activity event
    await pool.query(
      `INSERT INTO activity_events (user_id, business_id, event_type, metadata)
       VALUES (?, ?, 'POST_CREATED', ?)`,
      [
        userId,
        business_id,
        JSON.stringify({ post_id: post.post_id })
      ]
    );

    return post;
  }

  /**
   * Retrieves business posts feed.
   * @param {object} options 
   */
  async getFeed(options) {
    return postRepository.listFeed(options);
  }

  /**
   * Retrieves single post details.
   * @param {number|string} postId 
   */
  async getPostById(postId) {
    const post = await postRepository.findById(postId);
    if (!post) {
      throw new NotFoundError('Post not found', 'POST_NOT_FOUND');
    }
    return post;
  }

  /**
   * Adds an interaction (LIKE or COMMENT) to a post.
   * @param {number|string} userId 
   * @param {number|string} postId 
   * @param {object} param2 
   */
  async interact(userId, postId, { interaction_type, body = null }) {
    const post = await postRepository.findById(postId);
    if (!post) {
      throw new NotFoundError('Post not found', 'POST_NOT_FOUND');
    }

    if (interaction_type === 'LIKE') {
      const existingLike = await postRepository.findUserLike(postId, userId);
      if (existingLike) {
        // Toggle: Unlike
        await postRepository.deleteInteraction(existingLike.interaction_id);
        await postRepository.updateLikeCount(postId, -1);
        return {
          action: 'UNLIKED',
          post_id: postId
        };
      } else {
        // Like
        await postRepository.addInteraction({
          postId,
          userId,
          interactionType: 'LIKE'
        });
        await postRepository.updateLikeCount(postId, 1);

        // Record activity
        await pool.query(
          `INSERT INTO activity_events (user_id, business_id, event_type, metadata)
           VALUES (?, ?, 'POST_LIKED', ?)`,
          [userId, post.business_id, JSON.stringify({ post_id: postId })]
        );

        return {
          action: 'LIKED',
          post_id: postId
        };
      }
    }

    if (interaction_type === 'COMMENT') {
      const comment = await postRepository.addInteraction({
        postId,
        userId,
        interactionType: 'COMMENT',
        body
      });

      // Record activity
      await pool.query(
        `INSERT INTO activity_events (user_id, business_id, event_type, metadata)
         VALUES (?, ?, 'POST_COMMENTED', ?)`,
        [userId, post.business_id, JSON.stringify({ post_id: postId, comment_id: comment.interaction_id })]
      );

      return comment;
    }

    throw new BadRequestError('Invalid interaction type', 'INVALID_INTERACTION_TYPE');
  }

  /**
   * Retrieves interactions (comments/likes) for a post.
   * @param {number|string} postId 
   * @param {object} options 
   */
  async getInteractions(postId, options) {
    const post = await postRepository.findById(postId);
    if (!post) {
      throw new NotFoundError('Post not found', 'POST_NOT_FOUND');
    }

    return postRepository.listInteractions(postId, options);
  }
}

module.exports = new PostService();
