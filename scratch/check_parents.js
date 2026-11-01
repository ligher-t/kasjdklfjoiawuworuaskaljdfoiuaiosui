const path = require('path');
const { context } = require(path.resolve(__dirname, '../tests/support/presentation-cases.cjs'));
const env = context(path.resolve(__dirname, '..'));
env.ctx.setTimeout = setTimeout;
const vm = require('vm');

async function main() {
  const code = `
    (async () => {
      // Run 20 lives and collect parent stats
      const result = await runDevSimulation({
        count: 20,
        masterSeed: 20261026,
        maxYears: 120
      });
      return result;
    })()
  `;
  const result = await vm.runInContext(code, env.ctx);
  console.log("Simulated 20 lives. Inspecting sampleSummaries...");
  let totalParents = 0;
  let deadParents = 0;
  let maxParentAge = 0;
  let aliveParentMaxAge = 0;

  for (const s of result.sampleSummaries || []) {
    // sampleSummaries has parents or relative data if exported
  }
  console.log("Keys in sampleSummaries[0]:", Object.keys((result.sampleSummaries && result.sampleSummaries[0]) || {}));
}
main().catch(console.error);
