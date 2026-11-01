const path = require('path');
const { context } = require(path.resolve(__dirname, '../tests/support/presentation-cases.cjs'));
const env = context(path.resolve(__dirname, '..'));
env.ctx.setTimeout = setTimeout;
const vm = require('vm');

async function main() {
  const code = `
    (() => {
      const allEvents = EV || [];
      const choiceEvents = allEvents.filter(e => Array.isArray(e.c) && e.c.length > 0);
      const dailyEvents = allEvents.filter(e => !e.c || e.c.length === 0);

      // 分類
      const regionalDaily = dailyEvents.filter(e => e.id.startsWith('daily_') && !e.id.startsWith('daily_base_'));
      const baseDaily = dailyEvents.filter(e => !regionalDaily.includes(e));

      return {
        total: allEvents.length,
        choiceCount: choiceEvents.length,
        dailyCount: dailyEvents.length,
        regionalDailyCount: regionalDaily.length,
        baseDailyCount: baseDaily.length,
        sampleRegional: regionalDaily.slice(0, 5).map(e => e.id),
        sampleBase: baseDaily.slice(0, 10).map(e => e.id)
      };
    })()
  `;
  const result = vm.runInContext(code, env.ctx);
  console.log("Catalog breakdown:", JSON.stringify(result, null, 2));

  // Run a short simulation to see actual fire rate of daily vs choice
  const simCode = `
    (async () => {
      const sim = await runDevSimulation({ count: 20, masterSeed: 20261026, maxYears: 100 });
      let totalFired = 0;
      let dailyFired = 0;
      let choiceFired = 0;
      let regionalDailyFired = 0;
      let baseDailyFired = 0;
      
      const evMap = new Map((EV || []).map(e => [e.id, e]));

      for (const [id, count] of Object.entries(sim.analytics?.eventFireCounts || {})) {
        totalFired += count;
        const ev = evMap.get(id);
        if (!ev) continue;
        if (ev.c && ev.c.length > 0) {
          choiceFired += count;
        } else {
          dailyFired += count;
          if (id.startsWith('daily_') && !id.startsWith('daily_base_')) {
            regionalDailyFired += count;
          } else {
            baseDailyFired += count;
          }
        }
      }

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
        baseDailyShareOfDaily: (baseDailyFired / dailyFired * 100).toFixed(1) + '%'
      };
    })()
  `;
  const simResult = await vm.runInContext(simCode, env.ctx);
  console.log("Simulation fire stats:", JSON.stringify(simResult, null, 2));
}

main().catch(console.error);
