const path = require('path');
const { context } = require(path.resolve(__dirname, '../tests/support/presentation-cases.cjs'));
const env = context(path.resolve(__dirname, '..'));
env.ctx.setTimeout = setTimeout;
const vm = require('vm');

async function main() {
  console.log("Running 100-life simulation with full metrics...");
  env.ctx.__onProgress = (p) => {
    if (p.phase === "life-finished" && p.completed % 20 === 0) {
      console.log(`[Progress] completed: ${p.completed}/${p.total}, failed: ${p.failed}, elapsed: ${Math.round(p.elapsedMs/1000)}s`);
    }
  };
  
  const code = `
    (async () => {
      const result = await runDevSimulation({
        count: 100,
        masterSeed: 20261026,
        maxYears: 120
      }, {
        onProgress: __onProgress
      });
      return result;
    })()
  `;
  const result = await vm.runInContext(code, env.ctx);
  console.log("Summary:", JSON.stringify(result.summary, null, 2));
  console.log("Failures count:", result.failures.length);
  if (result.failures.length) {
    console.log("Failures:", result.failures.map(f => f.signature));
  }
  
  // Marriage coverage
  console.log("\n--- Romance & Marriage Coverage ---");
  for (const m of result.eventCoverage || []) {
    if (['romance_followup', 'romance_future_talk', 'romance_marriage_choice', 'romance_resolve_safety', 'family_daily_spouse_cooking', 'family_spouse_household_arrangement'].includes(m.eventId)) {
      console.log(`  ${m.eventId}: fired=${m.fired}, eligible=${m.eligibleSlots}`);
    }
  }
  
  // Re-employment coverage
  console.log("\n--- Re-employment Coverage ---");
  for (const m of result.eventCoverage || []) {
    if (['work_unemployed_reentry', 'work_elder_reentry', 'car'].includes(m.eventId)) {
      console.log(`  ${m.eventId}: fired=${m.fired}, eligible=${m.eligibleSlots}`);
    }
  }

  // Longest job-free
  console.log("\n--- Longest without recorded job (Top 3) ---");
  console.log(JSON.stringify(result.lifePaths?.longestWithoutRecordedJobExamples?.slice(0, 3), null, 2));

  // Economic health
  console.log("\n--- Economic Health Metrics ---");
  console.log(JSON.stringify(result.economicHealthMetrics, null, 2));
}

main().catch(console.error);
