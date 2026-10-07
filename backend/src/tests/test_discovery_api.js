const assert = require('assert');
const pool = require('../db');
const matchingEngine = require('../services/matching.engine');
const matchService = require('../services/match.service');
const discoveryService = require('../services/discovery.service');

async function runDiscoveryTests() {
  console.log('--- Starting Track 3 (Discovery & Matching) Tests ---');
  let passed = 0;
  let failed = 0;

  try {
    // 1. Test Matching Engine Logic
    console.log('[Test 1] Matching Engine Rules & Determinism...');
    const mockNeed = {
      category_id: 5,
      budget_min: 1000,
      budget_max: 5000,
      business_city: 'Austin',
      business_state: 'Texas',
      business_country: 'USA'
    };
    const mockService = {
      category_id: 5, // Exact match: +0.40
      price_min: 1500,
      price_max: 3000, // Fully within budget: +0.30
      business_city: 'Austin', // Same city: +0.15
      business_state: 'Texas',
      business_country: 'USA',
      business_status: 'VERIFIED' // Verified: +0.15
    };
    
    // Total should be 0.40 + 0.30 + 0.15 + 0.15 = 1.00
    const evalResult = matchingEngine.evaluateNeedAndService(mockNeed, mockService);
    assert.strictEqual(evalResult.score, 1.00, 'Matching engine score logic failed for perfect match');
    assert(evalResult.explanations.length > 0, 'Explanations should be generated');
    console.log('  ✓ Pass: Matching Engine computes scores deterministically');
    passed++;

    // 2. Test Discovery Service Validation / Execution (Empty Database resilience)
    console.log('[Test 2] Discovery Service Execution...');
    const result = await discoveryService.searchBusinesses({ page: 1, limit: 10 });
    assert(result.data !== undefined, 'Business discovery should return data array');
    assert(result.pagination !== undefined, 'Business discovery should return pagination');
    console.log('  ✓ Pass: Discovery service successfully executes business queries');
    passed++;
    
    // 3. Test Match Service Execution
    console.log('[Test 3] Match Service querying (Edge case execution)...');
    // Using an arbitrary non-existent ID just to verify SQL compiles and runs
    const matches = await matchService.getMatchesForNeed(999999, { limit: 5 });
    assert(Array.isArray(matches), 'Match results should be an array');
    console.log('  ✓ Pass: Match service successfully queries match data');
    passed++;

  } catch (err) {
    console.error('  ✗ Test failure:', err.message);
    failed++;
  } finally {
    await pool.end();
  }

  console.log('----------------------------------------------------');
  console.log(`Track 3 Tests Completed: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runDiscoveryTests();
