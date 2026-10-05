// database/tests/run_all.js
// Runs all test modules sequentially and summarizes results

const { run: runConstraints } = require('./test_constraints');
const { run: runFk } = require('./test_fk_integrity');
const db = require('./db');

async function main() {
  console.log('Starting Layer 1 Database Test Suite...\n');
  try {
    const cResult = await runConstraints();
    const fkResult = await runFk();
    
    const totalPassed = (cResult?.passed || 0) + (fkResult?.passed || 0);
    const totalFailed = (cResult?.failed || 0) + (fkResult?.failed || 0);

    console.log('\n=======================================');
    console.log(`TOTAL PASSED: ${totalPassed}`);
    console.log(`TOTAL FAILED: ${totalFailed}`);
    console.log('=======================================\n');

    await db.end();
    process.exit(totalFailed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Fatal error during test suite execution:', err);
    await db.end();
    process.exit(1);
  }
}

main();
