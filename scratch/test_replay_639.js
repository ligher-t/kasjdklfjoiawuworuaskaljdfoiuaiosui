const path = require('path');
const { context } = require(path.resolve(__dirname, '../tests/support/presentation-cases.cjs'));
const env = context(path.resolve(__dirname, '..'));
const vm = require('vm');

const code = `
(async () => {
  try {
    const result = await runDevSimulation({
      count: 1,
      replaySeed: 4126179723,
      replayBirthYear: 1077,
      maxYears: 120
    });
    console.log("Failures count:", result.failures.length);
    if (result.failures.length) {
      console.log("Failure:", JSON.stringify(result.failures[0], null, 2));
    }
  } catch (e) {
    console.error("Simulation error:", e);
  }
})()
`;

vm.runInContext(code, env.ctx);
