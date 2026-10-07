const assert = require('assert');
const pool = require('../db');
const authService = require('../services/auth.service');
const businessService = require('../services/business.service');
const categoryService = require('../services/category.service');
const serviceService = require('../services/service.service');
const needService = require('../services/need.service');

async function runBusinessTests() {
  console.log('--- Starting Track 2 (Business Profiles, Services & Needs) Tests ---');
  let passed = 0;
  let failed = 0;

  let ownerUser = null;
  let staffUser = null;
  let createdCategory = null;
  let createdBusiness = null;
  let createdService = null;
  let createdNeed = null;

  try {
    // 1. Create test owner and staff users
    console.log('[Test 1] Setting up test users...');
    const ownerReg = await authService.register({
      email: `owner_${Date.now()}@biztest.com`,
      phone: `+1888${Math.floor(100000 + Math.random() * 900000)}`,
      password: 'Password123!',
      full_name: 'Test Owner',
      role: 'OWNER'
    });
    ownerUser = ownerReg.user;

    const staffReg = await authService.register({
      email: `staff_${Date.now()}@biztest.com`,
      phone: `+1777${Math.floor(100000 + Math.random() * 900000)}`,
      password: 'Password123!',
      full_name: 'Test Staff',
      role: 'PARTNER'
    });
    staffUser = staffReg.user;
    console.log(`  ✓ Pass: Test users created (Owner ID: ${ownerUser.userId}, Staff ID: ${staffUser.userId})`);
    passed++;

    // 2. Category creation & tree retrieval
    console.log('[Test 2] Category management & hierarchy...');
    createdCategory = await categoryService.createCategory({
      name: `Category_${Date.now()}`
    });
    assert(createdCategory.category_id, 'Category ID missing');
    assert(createdCategory.slug, 'Category slug missing');

    const tree = await categoryService.getCategoryTree();
    assert(Array.isArray(tree), 'Category tree should be an array');
    console.log(`  ✓ Pass: Category created with slug ${createdCategory.slug} and tree verified`);
    passed++;

    // 3. Business Creation within ACID Transaction
    console.log('[Test 3] Business creation (transaction with owner membership & activity)...');
    createdBusiness = await businessService.createBusiness(ownerUser.userId, {
      name: 'Acme Innovation Lab',
      primary_category_id: createdCategory.category_id,
      description: 'Pioneering next-gen digital solutions',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA'
    });
    assert(createdBusiness.business_id, 'Business ID missing');
    assert.strictEqual(createdBusiness.slug, 'acme-innovation-lab');

    // Verify activity event and membership created in DB
    const [events] = await pool.query(
      `SELECT * FROM activity_events WHERE business_id = ? AND event_type = 'BUSINESS_CREATED'`,
      [createdBusiness.business_id]
    );
    assert.strictEqual(events.length, 1, 'Activity event was not created for business');

    const [members] = await pool.query(
      `SELECT * FROM business_members WHERE business_id = ? AND user_id = ?`,
      [createdBusiness.business_id, ownerUser.userId]
    );
    assert.strictEqual(members.length, 1, 'Owner was not enrolled in business_members');
    assert.strictEqual(members[0].member_role, 'ADMIN');
    console.log(`  ✓ Pass: Business ${createdBusiness.name} created with transaction verification`);
    passed++;

    // 4. Duplicate business name slug disambiguation
    console.log('[Test 4] Duplicate business name slug collision handling...');
    const duplicateBiz = await businessService.createBusiness(ownerUser.userId, {
      name: 'Acme Innovation Lab',
      description: 'Second branch'
    });
    assert.strictEqual(duplicateBiz.slug, 'acme-innovation-lab-1');
    console.log(`  ✓ Pass: Slug collision handled successfully: ${duplicateBiz.slug}`);
    passed++;

    // Cleanup duplicate business
    await pool.query('DELETE FROM businesses WHERE business_id = ?', [duplicateBiz.business_id]);

    // 5. Business Profile Retrieval with Services, Needs, and Members
    console.log('[Test 5] Composite business profile retrieval...');
    const profile = await businessService.getBusinessProfile(createdBusiness.business_id);
    assert.strictEqual(profile.business_id, createdBusiness.business_id);
    assert.strictEqual(profile.owner_name, 'Test Owner');
    assert(Array.isArray(profile.services), 'Services array missing');
    assert(Array.isArray(profile.needs), 'Needs array missing');
    assert(Array.isArray(profile.members), 'Members array missing');
    assert.strictEqual(profile.members.length, 1);
    console.log('  ✓ Pass: Business composite profile retrieved successfully');
    passed++;

    // 6. Business Profile Update
    console.log('[Test 6] Business profile update...');
    const updatedBiz = await businessService.updateBusiness(createdBusiness.business_id, {
      description: 'Updated innovative laboratory description',
      city: 'Oakland'
    });
    assert.strictEqual(updatedBiz.city, 'Oakland');
    assert.strictEqual(updatedBiz.description, 'Updated innovative laboratory description');
    console.log('  ✓ Pass: Business profile updated');
    passed++;

    // 7. Add & Manage Members
    console.log('[Test 7] Business membership invitation & retrieval...');
    const addedMember = await businessService.addMember(createdBusiness.business_id, {
      user_id: staffUser.userId,
      member_role: 'STAFF'
    });
    assert.strictEqual(addedMember.user_id, staffUser.userId);
    assert.strictEqual(addedMember.member_role, 'STAFF');

    const memberList = await businessService.getMembers(createdBusiness.business_id);
    assert.strictEqual(memberList.length, 2);
    console.log('  ✓ Pass: Staff member added and verified in member list');
    passed++;

    // 8. Service Creation, Update, and Deletion
    console.log('[Test 8] Business service lifecycle...');
    createdService = await serviceService.createService(createdBusiness.business_id, {
      title: 'Fullstack Web Consulting',
      category_id: createdCategory.category_id,
      price_min: 1500,
      price_max: 5000,
      status: 'ACTIVE'
    });
    assert(createdService.service_id, 'Service ID missing');
    assert.strictEqual(createdService.title, 'Fullstack Web Consulting');

    const services = await serviceService.getBusinessServices(createdBusiness.business_id);
    assert.strictEqual(services.length, 1);

    const updatedService = await serviceService.updateService(
      createdService.service_id,
      createdBusiness.business_id,
      { price_max: 6000 }
    );
    assert.strictEqual(parseFloat(updatedService.price_max), 6000);
    console.log('  ✓ Pass: Service created and updated successfully');
    passed++;

    // 9. Need Creation, Update, and Deletion
    console.log('[Test 9] Business need lifecycle...');
    createdNeed = await needService.createNeed(createdBusiness.business_id, {
      title: 'Senior Frontend Engineer Needed',
      category_id: createdCategory.category_id,
      budget_min: 3000,
      budget_max: 7000,
      deadline: '2026-12-31'
    });
    assert(createdNeed.need_id, 'Need ID missing');
    assert.strictEqual(createdNeed.title, 'Senior Frontend Engineer Needed');

    const needs = await needService.getBusinessNeeds(createdBusiness.business_id);
    assert.strictEqual(needs.length, 1);

    const updatedNeed = await needService.updateNeed(
      createdNeed.need_id,
      createdBusiness.business_id,
      { budget_max: 8000 }
    );
    assert.strictEqual(parseFloat(updatedNeed.budget_max), 8000);
    console.log('  ✓ Pass: Need created and updated successfully');
    passed++;

    // 10. Member Removal & Cascade/Teardown checks
    console.log('[Test 10] Member removal...');
    const removalResult = await businessService.removeMember(createdBusiness.business_id, staffUser.userId);
    assert.strictEqual(removalResult.message, 'Member removed successfully');
    const remainingMembers = await businessService.getMembers(createdBusiness.business_id);
    assert.strictEqual(remainingMembers.length, 1);
    console.log('  ✓ Pass: Member removed successfully');
    passed++;

  } catch (err) {
    console.error('  ✗ Test failure:', err);
    failed++;
  } finally {
    // Teardown test artifacts
    try {
      if (createdBusiness) {
        await pool.query('DELETE FROM businesses WHERE business_id = ?', [createdBusiness.business_id]);
      }
      if (createdCategory) {
        await pool.query('DELETE FROM categories WHERE category_id = ?', [createdCategory.category_id]);
      }
      if (ownerUser) {
        await pool.query('DELETE FROM users WHERE user_id = ?', [ownerUser.userId]);
      }
      if (staffUser) {
        await pool.query('DELETE FROM users WHERE user_id = ?', [staffUser.userId]);
      }
      console.log('[Cleanup] Test data cleaned up successfully.');
    } catch (cleanErr) {
      console.error('[Cleanup Error]', cleanErr.message);
    }
    await pool.end();
  }

  console.log('----------------------------------------------------');
  console.log(`Track 2 Tests Completed: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runBusinessTests();
