const fs = require('fs');
const { execSync } = require('child_process');
const node = process.execPath;
const tests = fs.readdirSync('tests').filter(f => f.endsWith('.test.cjs') || f.endsWith('.js'));
console.log(`Running ${tests.length} tests...`);
let passed = 0;
let failed = 0;
for (let i = 0; i < tests.length; i++) {
  const t = tests[i];
  const p = 'tests/' + t;
  const start = Date.now();
  try {
    const cmd = t.endsWith('.test.cjs') ? `"${node}" --test "${p}"` : `"${node}" "${p}"`;
    execSync(cmd, { stdio: 'pipe' });
    const ms = Date.now() - start;
    passed++;
    console.log(`[${i + 1}/${tests.length}] PASS (${ms}ms): ${t}`);
  } catch (err) {
    const ms = Date.now() - start;
    failed++;
    console.error(`[${i + 1}/${tests.length}] FAIL (${ms}ms): ${t}`);
    console.error(err.stdout ? err.stdout.toString().slice(0, 500) : err.message);
  }
}
if (failed === 0) {
  console.log(`\nALL ${passed} TESTS PASSED!`);
} else {
  console.log(`\n${failed} tests failed out of ${tests.length} (${passed} passed)`);
  process.exit(1);
}
