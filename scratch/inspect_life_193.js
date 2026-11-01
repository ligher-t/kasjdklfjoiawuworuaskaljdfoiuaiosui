const path = require('path');
const { context } = require(path.resolve(__dirname, '../tests/support/presentation-cases.cjs'));
const env = context(path.resolve(__dirname, '..'));
const vm = require('vm');

const code = `
(async () => {
  const origAudit = auditLifeState;
  auditLifeState = (s) => {
    const problems = origAudit(s);
    if (problems.some(p => p.includes("配偶者の別居支援受取"))) {
      console.log("=== FAILING STATE VALIDATION 193 ===");
      console.log("Year:", s.year, "Age:", s.age);
      console.log("Problems:", problems);
      console.log("separateSupportHistory:", JSON.stringify(s.sp?.separateSupportHistory || s.separateSupportHistory, null, 2));
      console.log("supportReceipts:", JSON.stringify(s.sp?.personalFinance?.supportReceipts || s.sp?.supportReceipts, null, 2));
      console.log("personalFinance.history:", JSON.stringify(s.sp?.personalFinance?.history?.slice(-3), null, 2));
    }
    return problems;
  };

  await runDevSimulation({
    count: 1,
    replaySeed: 2654264587,
    replayBirthYear: 1077,
    maxYears: 120
  });
})()
`;

vm.runInContext(code, env.ctx);
