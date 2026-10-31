const path = require('path');
const { context } = require(path.resolve(__dirname, '../tests/support/presentation-cases.cjs'));
const env = context(path.resolve(__dirname, '..'));
env.ctx.setTimeout = setTimeout;
const vm = require('vm');

async function main() {
  const code = `
    (async () => {
      const sim = await runDevSimulation({ count: 20, masterSeed: 20261026, maxYears: 100 });
      const evMap = new Map((EV || []).map(e => [e.id, e]));

      let totalFired = 0;
      let choiceFired = 0;
      let dailyFired = 0;
      let regionalDailyFired = 0;
      let baseDailyFired = 0;
      let topDaily = [];

      for (const cov of sim.eventCoverage || []) {
        if (!cov.fired) continue;
        totalFired += cov.fired;
        const ev = evMap.get(cov.eventId);
        if (ev && ev.c && ev.c.length > 0) {
          choiceFired += cov.fired;
        } else {
          dailyFired += cov.fired;
          if (cov.eventId.startsWith('daily_') && !cov.eventId.startsWith('daily_base_')) {
            regionalDailyFired += cov.fired;
          } else {
            baseDailyFired += cov.fired;
          }
          topDaily.push({ id: cov.eventId, fired: cov.fired });
        }
      }

      topDaily.sort((a, b) => b.fired - a.fired);

      return {
        totalSlots: sim.summary?.totalEventSlots,
        totalFired,
        choiceFired,
        choiceRate: (choiceFired / totalFired * 100).toFixed(1) + '%',
        dailyFired,
        dailyRate: (dailyFired / totalFired * 100).toFixed(1) + '%',
        regionalDailyFired,
        regionalDailyShareOfDaily: (regionalDailyFired / dailyFired * 100).toFixed(1) + '%',
        baseDailyFired,
        baseDailyShareOfDaily: (baseDailyFired / dailyFired * 100).toFixed(1) + '%',
        top10Daily: topDaily.slice(0, 10)
      };
    })()
  `;
  const simResult = await vm.runInContext(code, env.ctx);
  console.log("Real Simulation Stats:", JSON.stringify(simResult, null, 2));
}

main().catch(console.error);
