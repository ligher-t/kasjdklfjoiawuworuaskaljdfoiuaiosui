'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const {context} = require('./support/annual-cases.cjs');

(async () => {
  const {ctx} = context(path.resolve(__dirname, '..'));
  ctx.setTimeout = setTimeout;
  const observations = [], originalLifeMetrics = ctx.devLifeMetrics;
  ctx.devLifeMetrics = status => {
    observations.push(vm.runInContext(`(()=>{
      const metrics=employmentUxFor(S)?.metrics||{};
      return {
        employmentDecisionsShown:Number(metrics.employmentDecisionsShown||0),
        routineEmploymentDecisionStreakMax:Number(metrics.routineEmploymentDecisionStreakMax||0),
        routineEmploymentDecisionsInFiveMax:Number(metrics.routineEmploymentDecisionsInFiveMax||0),
        repeatPromptSameTopicWithoutRevision:Number(metrics.repeatPromptSameTopicWithoutRevision||0)
      };
    })()`, ctx));
    return originalLifeMetrics(status);
  };
  ctx.employmentObservationOptions = {
    count: 5, masterSeed: 2026110505, maxYears: 25,
    birthYearMin: 1070, birthYearMax: 1070, regionSampling: 'natural'
  };
  const report = await vm.runInContext('runDevSimulation(employmentObservationOptions)', ctx);
  const rows = observations;
  assert.equal(report.summary.attempted, 5);
  assert.equal(rows.length, report.summary.sampled,
    'only completed lives have employment prompt diagnostics');
  assert.equal(report.summary.runtimeFailures + report.summary.stateFailures, 0,
    'fixed normal-play sample must finish without simulation failures: ' + JSON.stringify(report.failures));
  const decisions = rows.reduce((sum, row) => sum + row.employmentDecisionsShown, 0);
  assert(decisions > 0, 'fixed normal-play sample must exercise real employment choices');
  for (const row of rows) {
    assert(row.routineEmploymentDecisionStreakMax <= 2,
      `employment choice streak exceeded policy in life ${row.lifeIndex}`);
    assert(row.routineEmploymentDecisionsInFiveMax <= 2,
      `employment choices exceeded the five-choice window in life ${row.lifeIndex}`);
    assert.equal(row.repeatPromptSameTopicWithoutRevision, 0,
      `unchanged employment topic repeated in life ${row.lifeIndex}`);
  }
  console.log('Normal-play employment choice observation: ' + JSON.stringify({
    sample: '5 fixed-seed lives, 25-year limit, natural region sampling',
    completed: report.summary.sampled,
    processedYears: report.summary.processedYears,
    employmentDecisions: decisions,
    maxRoutineStreak: Math.max(...rows.map(row => row.routineEmploymentDecisionStreakMax)),
    maxRoutineChoicesInAnyFive: Math.max(...rows.map(row => row.routineEmploymentDecisionsInFiveMax)),
    unchangedTopicRepeats: rows.reduce((sum, row) => sum + row.repeatPromptSameTopicWithoutRevision, 0),
    runtimeOrStateFailures: report.summary.runtimeFailures + report.summary.stateFailures
  }));
})().catch(error => { console.error(error); process.exitCode = 1; });
