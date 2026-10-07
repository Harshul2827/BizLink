const assert = require('assert');
const pool = require('../db');
const authService = require('../services/auth.service');
const analyticsService = require('../services/analytics.service');

async function runAnalyticsTests() {
  console.log('--- Starting Track 6 (Power BI-Adjacent Analytics & Reporting) Tests ---');
  let passed = 0;
  let failed = 0;

  let adminUser = null;

  try {
    // 1. Setup Admin user
    console.log('[Test 1] Setting up admin user for analytics...');
    const adminReg = await authService.register({
      email: `analytics_admin_${Date.now()}@biztest.com`,
      phone: `+1555${Math.floor(100000 + Math.random() * 900000)}`,
      password: 'Password123!',
      full_name: 'Analytics Admin',
      role: 'ADMIN'
    });
    adminUser = adminReg.user;
    assert(adminUser.userId, 'Admin user creation failed');
    console.log(`  ✓ Pass: Admin user created (ID: ${adminUser.userId})`);
    passed++;

    // 2. Platform Overview KPIs
    console.log('[Test 2] Querying platform overview KPIs...');
    const overview = await analyticsService.getOverview();
    assert(overview.kpi_summary, 'Missing kpi_summary in overview response');
    assert('total_active_businesses' in overview.kpi_summary, 'Missing total_active_businesses');
    assert('total_active_users' in overview.kpi_summary, 'Missing total_active_users');
    assert('total_active_services' in overview.kpi_summary, 'Missing total_active_services');
    assert('total_needs' in overview.kpi_summary, 'Missing total_needs');
    assert('total_active_connections' in overview.kpi_summary, 'Missing total_active_connections');
    assert('active_collaborations' in overview.kpi_summary, 'Missing active_collaborations');
    assert(Array.isArray(overview.top_categories), 'top_categories must be an array');
    assert(Array.isArray(overview.top_locations), 'top_locations must be an array');
    console.log('  ✓ Pass: Platform overview KPIs verified');
    passed++;

    // 3. Collaboration Analytics
    console.log('[Test 3] Querying collaboration metrics...');
    const collabMetrics = await analyticsService.getCollaborationAnalytics();
    assert(Array.isArray(collabMetrics.status_breakdown), 'status_breakdown must be an array');
    assert('completed_count' in collabMetrics.completed_metrics, 'Missing completed_count');
    console.log('  ✓ Pass: Collaboration metrics and duration analytics verified');
    passed++;

    // 4. Trust & Verification Analytics
    console.log('[Test 4] Querying trust & verification metrics...');
    const trustMetrics = await analyticsService.getTrustAnalytics();
    assert(Array.isArray(trustMetrics.ratings_distribution), 'ratings_distribution must be an array');
    assert(Array.isArray(trustMetrics.verification_status), 'verification_status must be an array');
    console.log('  ✓ Pass: Trust and verification distribution metrics verified');
    passed++;

    // 5. Growth Analytics
    console.log('[Test 5] Querying growth metrics...');
    const growthMetrics = await analyticsService.getGrowthAnalytics();
    assert(Array.isArray(growthMetrics.businesses), 'businesses growth must be an array');
    assert(Array.isArray(growthMetrics.users), 'users growth must be an array');
    console.log('  ✓ Pass: Platform growth time-series data verified');
    passed++;

    // 6. Data Integrity Audit Helper
    console.log('[Test 6] Running data integrity audit check...');
    const audit = await analyticsService.runAudit();
    assert(audit.integrity_status, 'Missing integrity_status in audit response');
    assert(audit.audit_results, 'Missing audit_results in audit response');
    console.log(`  ✓ Pass: Data integrity audit completed (Status: ${audit.integrity_status})`);
    passed++;

  } catch (err) {
    console.error('  ✗ Test failure:', err);
    failed++;
  } finally {
    // Teardown test admin
    try {
      if (adminUser) {
        await pool.query('DELETE FROM users WHERE user_id = ?', [adminUser.userId]);
        console.log('[Cleanup] Test admin cleaned up.');
      }
    } catch (cleanErr) {
      console.error('[Cleanup Error]', cleanErr.message);
    }
    await pool.end();
  }

  console.log('----------------------------------------------------');
  console.log(`Track 6 Tests Completed: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runAnalyticsTests();
