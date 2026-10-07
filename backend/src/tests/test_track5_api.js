require('dotenv').config();
const assert = require('assert');
const pool = require('../db');
const authService = require('../services/auth.service');
const businessService = require('../services/business.service');
const collaborationService = require('../services/collaboration.service');
const reviewService = require('../services/review.service');
const postService = require('../services/post.service');
const adminService = require('../services/admin.service');

async function runTrack5Tests() {
  console.log('--- Starting Track 5 (Collaborations, Reviews, Posts, Admin Moderation) Tests ---');
  let passed = 0;
  let failed = 0;

  let userA = null;
  let userB = null;
  let adminUser = null;
  let bizA = null;
  let bizB = null;
  let collaboration = null;
  let post = null;
  let report = null;

  try {
    // 1. Setup test users (Owner A, Owner B, Admin) and businesses
    console.log('[Test 1] Setting up users and businesses for Track 5...');
    const regA = await authService.register({
      email: `track5_a_${Date.now()}@test.com`,
      phone: `+1711${Math.floor(100000 + Math.random() * 900000)}`,
      password: 'Password123!',
      full_name: 'Alice Collab',
      role: 'OWNER'
    });
    userA = regA.user;

    const regB = await authService.register({
      email: `track5_b_${Date.now()}@test.com`,
      phone: `+1722${Math.floor(100000 + Math.random() * 900000)}`,
      password: 'Password123!',
      full_name: 'Bob Partner',
      role: 'PARTNER'
    });
    userB = regB.user;

    const regAdmin = await authService.register({
      email: `track5_admin_${Date.now()}@test.com`,
      phone: `+1733${Math.floor(100000 + Math.random() * 900000)}`,
      password: 'Password123!',
      full_name: 'Adam Moderator',
      role: 'ADMIN'
    });
    adminUser = regAdmin.user;

    bizA = await businessService.createBusiness(userA.userId, {
      name: `Collab Studio ${Date.now()}`,
      city: 'Austin',
      state: 'TX',
      country: 'USA'
    });

    bizB = await businessService.createBusiness(userB.userId, {
      name: `Synergy Works ${Date.now()}`,
      city: 'Dallas',
      state: 'TX',
      country: 'USA'
    });

    assert(bizA.business_id, 'BizA creation failed');
    assert(bizB.business_id, 'BizB creation failed');
    console.log(`  ✓ Pass: Initialized BizA (${bizA.business_id}), BizB (${bizB.business_id}), and Admin`);
    passed++;

    // 2. Reject self-collaboration
    console.log('[Test 2] Preventing self-collaboration...');
    let selfCollabFailed = false;
    try {
      await collaborationService.createCollaboration(userA.userId, {
        initiator_business_id: bizA.business_id,
        partner_business_ids: [bizA.business_id],
        title: 'Invalid Self Project'
      });
    } catch (err) {
      if (err.statusCode === 400) selfCollabFailed = true;
    }
    assert.strictEqual(selfCollabFailed, true, 'Self-collaboration was not rejected with 400');
    console.log('  ✓ Pass: Self-collaboration properly rejected');
    passed++;

    // 3. Create valid collaboration (BizA -> BizB)
    console.log('[Test 3] Creating B2B collaboration...');
    collaboration = await collaborationService.createCollaboration(userA.userId, {
      initiator_business_id: bizA.business_id,
      partner_business_ids: [bizB.business_id],
      title: 'Q4 Joint Venture',
      status: 'REQUESTED'
    });
    assert(collaboration.collaboration_id, 'Collaboration ID missing');
    assert.strictEqual(collaboration.status, 'REQUESTED');
    assert.strictEqual(collaboration.participants.length, 2, 'Should have 2 participants');
    console.log(`  ✓ Pass: Collaboration created in REQUESTED status (ID: ${collaboration.collaboration_id})`);
    passed++;

    // 4. State transition sequence (REQUESTED -> NEGOTIATING -> ACCEPTED -> ACTIVE -> COMPLETED)
    console.log('[Test 4] Transitioning collaboration lifecycle to COMPLETED...');
    collaboration = await collaborationService.updateStatus(userB.userId, collaboration.collaboration_id, {
      status: 'NEGOTIATING'
    });
    assert.strictEqual(collaboration.status, 'NEGOTIATING');

    collaboration = await collaborationService.updateStatus(userB.userId, collaboration.collaboration_id, {
      status: 'ACCEPTED'
    });
    assert.strictEqual(collaboration.status, 'ACCEPTED');

    collaboration = await collaborationService.updateStatus(userA.userId, collaboration.collaboration_id, {
      status: 'ACTIVE'
    });
    assert.strictEqual(collaboration.status, 'ACTIVE');

    collaboration = await collaborationService.updateStatus(userA.userId, collaboration.collaboration_id, {
      status: 'COMPLETED'
    });
    assert.strictEqual(collaboration.status, 'COMPLETED');
    assert(collaboration.end_date, 'End date should be populated on completion');
    console.log('  ✓ Pass: Full collaboration lifecycle transition succeeded');
    passed++;

    // 5. Reviews: Self-review rejection
    console.log('[Test 5] Preventing self-review...');
    let selfRevFailed = false;
    try {
      await reviewService.createReview(userA.userId, {
        reviewer_business_id: bizA.business_id,
        reviewed_business_id: bizA.business_id,
        rating: 5
      });
    } catch (err) {
      if (err.statusCode === 400) selfRevFailed = true;
    }
    assert.strictEqual(selfRevFailed, true, 'Self-review was not rejected');
    console.log('  ✓ Pass: Self-review properly rejected');
    passed++;

    // 6. Reviews: Author review on completed collaboration
    console.log('[Test 6] Creating review on completed collaboration...');
    const review = await reviewService.createReview(userA.userId, {
      reviewer_business_id: bizA.business_id,
      reviewed_business_id: bizB.business_id,
      collaboration_id: collaboration.collaboration_id,
      rating: 5,
      title: 'Outstanding partner delivery and communication'
    });
    assert(review.review_id, 'Review ID missing');
    assert.strictEqual(review.rating, 5);
    console.log(`  ✓ Pass: Review created successfully (ID: ${review.review_id})`);
    passed++;

    // 7. Duplicate review rejection for same collaboration
    console.log('[Test 7] Preventing duplicate review on same collaboration...');
    let duplicateRevFailed = false;
    try {
      await reviewService.createReview(userA.userId, {
        reviewer_business_id: bizA.business_id,
        reviewed_business_id: bizB.business_id,
        collaboration_id: collaboration.collaboration_id,
        rating: 4
      });
    } catch (err) {
      if (err.statusCode === 409) duplicateRevFailed = true;
    }
    assert.strictEqual(duplicateRevFailed, true, 'Duplicate review was not rejected with 409 Conflict');
    console.log('  ✓ Pass: Duplicate review properly rejected');
    passed++;

    // 8. Aggregate rating stats verification
    console.log('[Test 8] Verifying aggregate rating stats...');
    const reviewStats = await reviewService.getBusinessReviews(bizB.business_id);
    assert.strictEqual(reviewStats.stats.totalReviews, 1);
    assert.strictEqual(reviewStats.stats.averageRating, 5);
    console.log('  ✓ Pass: Rating aggregate statistics calculated correctly');
    passed++;

    // 9. Posts & Interactions: Create post and feed
    console.log('[Test 9] Creating business post and retrieving feed...');
    post = await postService.createPost(userA.userId, {
      business_id: bizA.business_id,
      content: 'Excited to announce our new expansion into Texas logistics!'
    });
    assert(post.post_id, 'Post ID missing');
    assert.strictEqual(post.like_count, 0);

    const feed = await postService.getFeed({ businessId: bizA.business_id });
    assert(feed.length >= 1, 'Post feed is empty');
    console.log(`  ✓ Pass: Post created and retrieved in feed (ID: ${post.post_id})`);
    passed++;

    // 10. Post Interactions: Like, Unlike toggle, Comment
    console.log('[Test 10] Testing post interactions (Like, Toggle unlike, Comment)...');
    const likeRes = await postService.interact(userB.userId, post.post_id, { interaction_type: 'LIKE' });
    assert.strictEqual(likeRes.action, 'LIKED');

    const commentRes = await postService.interact(userB.userId, post.post_id, {
      interaction_type: 'COMMENT',
      body: 'Congratulations on the milestone!'
    });
    assert.strictEqual(commentRes.interaction_type, 'COMMENT');

    const unlikeRes = await postService.interact(userB.userId, post.post_id, { interaction_type: 'LIKE' });
    assert.strictEqual(unlikeRes.action, 'UNLIKED');
    console.log('  ✓ Pass: Post like toggle and comments working seamlessly');
    passed++;

    // 11. User Report submission & Admin resolution
    console.log('[Test 11] Submitting and resolving moderation report...');
    report = await adminService.submitReport(userB.userId, {
      target_type: 'POST',
      target_id: post.post_id,
      reason: 'Testing report functionality for safety'
    });
    assert(report.report_id, 'Report ID missing');
    assert.strictEqual(report.status, 'OPEN');

    const resolvedReport = await adminService.resolveReport(adminUser.userId, report.report_id);
    assert.strictEqual(resolvedReport.status, 'RESOLVED');
    assert.strictEqual(resolvedReport.admin_user_id, adminUser.userId);
    console.log(`  ✓ Pass: Report submitted and resolved by admin (Report ID: ${report.report_id})`);
    passed++;

    // 12. Admin Moderation: Business status change
    console.log('[Test 12] Admin moderating business status to VERIFIED...');
    const verifiedBiz = await adminService.updateBusinessStatus(adminUser.userId, bizA.business_id, 'VERIFIED');
    assert.strictEqual(verifiedBiz.status, 'VERIFIED');
    console.log('  ✓ Pass: Business status successfully updated to VERIFIED by admin');
    passed++;

  } catch (err) {
    console.error('  ✗ Track 5 Test Failed with error:', err);
    failed++;
  } finally {
    console.log(`\nTrack 5 Test Summary: ${passed} passed, ${failed} failed`);
    if (failed > 0) {
      process.exit(1);
    }
  }
}

if (require.main === module) {
  runTrack5Tests()
    .then(() => {
      console.log('All Track 5 tests completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Fatal error during Track 5 test execution:', err);
      process.exit(1);
    });
}

module.exports = runTrack5Tests;
