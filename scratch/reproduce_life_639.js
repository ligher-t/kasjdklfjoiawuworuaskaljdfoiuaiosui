const { context } = require('./tests/support/presentation-cases.cjs');
const env = context(process.cwd());
const vm = require('vm');

const code = `
(() => {
  const seed = 4126179723;
  const by = 1077;
  // Initialize life
  init(by, seed);
  console.log("Life 639 initialized:", S.nm, S.r.n, S.res.n);
  
  // Advance until 1144 or until state problems
  for (let year = by; year <= 1144; year++) {
    for (let slot = 0; slot < 12; slot++) {
      if (S.dead) break;
      tick();
      // If choice event, pick choice like sim does
      if (typeof PENDING_CHOICE !== 'undefined' && PENDING_CHOICE) {
        // pick choice
        pickChoice(0);
      }
    }
    if (S.dead) break;
    // Check state problems after annual update
    const problems = validateState(S);
    const econProblems = problems.filter(p => p.includes("年次収支履歴"));
    if (econProblems.length) {
      console.log("Found problem at year", S.year, "age", S.age, ":", econProblems);
      console.log("annualEconomyHistory last 2:", JSON.stringify(S.annualEconomyHistory?.slice(-2), null, 2));
      break;
    }
  }
})()
`;

try {
  vm.runInContext(code, env.ctx);
} catch (e) {
  console.error("Error during run:", e);
}
