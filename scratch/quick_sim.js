const path = require('path');
const { context } = require(path.resolve(__dirname, '../tests/support/presentation-cases.cjs'));
const env = context(path.resolve(__dirname, '..'));
env.ctx.setTimeout = setTimeout;
const vm = require('vm');

async function main() {
  const code = `
    (async () => {
      const res = await runDevSimulation({ count: 10, masterSeed: 20261026, maxYears: 100 });
      return {
        failureCount: res.summary.failureCount,
        processedYears: res.summary.processedYears,
        died: res.summary.died,
        runtimeFailures: res.summary.runtimeFailures,
        stateFailures: res.summary.stateFailures,
        totalStateChecks: res.summary.totalStateChecks
      };
    })()
  `;
  const result = await vm.runInContext(code, env.ctx);
  console.log("Sim result:", JSON.stringify(result, null, 2));
}

main().catch(console.error);
