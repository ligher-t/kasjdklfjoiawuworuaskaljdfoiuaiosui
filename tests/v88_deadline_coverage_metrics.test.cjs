'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const {context} = require('./support/annual-cases.cjs');
const {ctx} = context(path.resolve(__dirname, '..'));
ctx.setTimeout = setTimeout;
const read = code => JSON.parse(vm.runInContext('JSON.stringify((()=>{' + code + '})())',ctx,{timeout:30000}));

function pressure(firstMonth, count) {
  ctx.PRESSURE = {firstMonth, count};
  return read(`
    const {firstMonth,count}=PRESSURE;
    born({seed:197610 + count,by:1060,region:'ヴィクトリア'});
    S.year=1098;S.age=38;S.mo=0;S.world={events:{}};
    S.educationDecision=null;S.majorEventMonth=null;
    const original=EV.slice(),oldFire=fire,selected=[];
    const events=Array.from({length:count},(_,i)=>({
      id:'capacity_limit_'+i,st:['壮年'],
      after:{id:'capacity_origin_'+i,min:1,max:3},
      c:[{l:'回答',o:[[1,'確認した',{}]]}],w:1
    }));
    try {
      EV.splice(0,EV.length,...events);
      resetSimulationStatistics();STAT.currentLife=0;
      for(let i=0;i<count;i++)S.sn['capacity_origin_'+i]=1095;
      S.q=[(firstMonth-0.5)/CALENDAR_MONTHS];
      fire=(event,s)=>{
        recordSimulationEvent(event,s);
        selected.push({id:event.id,month:s.mo});
        s.sn[event.id]=s.year;
        s.majorEventMonth={year:s.year,month:s.mo};
      };
      while(S.q.length)slot(S.q.shift());
      finalizeSimulationDeadlineYear(S);
      const metrics=JSON.parse(JSON.stringify(STAT.deadlineCoverage));
      return {selected,metrics,months:new Set(selected.map(row=>row.month)).size,
        year:S.year,queue:S.q.length,limit:P('events.slotPlacementCeiling')};
    } finally { fire=oldFire;EV.splice(0,EV.length,...original); }
  `);
}
const full = pressure(1,13);
const allowedMonths = Array.from({length:12},(_,i)=>i+1)
  .filter(month=>(month-0.5)/12 < full.limit).length;
assert.equal(full.selected.length,allowedMonths,'a full-year overflow uses only permitted calendar months');
assert.equal(full.months,allowedMonths,'no two protected choices fire in the same month');
assert(full.selected.every(x=>x.month>=1&&x.month<=12),'no 13th month can be generated');
assert.equal(full.queue,0);
assert.equal(full.metrics.observed,13);
assert.equal(full.metrics.delivered,allowedMonths);
assert.equal(full.metrics.expiredUnserved,13-allowedMonths);
assert.equal(full.metrics.censored,0);
assert.equal(Object.keys(full.metrics.byEvent).length,13);
const late=pressure(11,5);
const lateAllowed=[11,12].filter(month=>(month-0.5)/12<late.limit).length;
assert.equal(late.selected.length,lateAllowed,'a late-year overload never rewinds calendar months');
assert(late.selected.every(x=>x.month>=11));
assert.equal(late.metrics.observed,5);
assert.equal(late.metrics.delivered,lateAllowed);
assert.equal(late.metrics.expiredUnserved,5-lateAllowed);

// The real developer runner must collect results over complete years, keep
// death-censored observations out of expiry, and preserve reproducibility.
(async()=>{
  const options={count:19,masterSeed:19761103,maxYears:process.argv.includes('--long-run')?65:10,birthYearMin:1060,birthYearMax:1075,regionSampling:'balanced'};
  ctx.auditOptions=options;
  const report=await vm.runInContext('runDevSimulation(auditOptions)',ctx);
  const coverage=JSON.parse(JSON.stringify(report.deadlineCoverage));
  console.log(JSON.stringify({simulationFailures:report.failures.map(row=>({type:row.type,eventId:row.eventId,error:row.error,count:row.count,seed:row.example.seed}))}));
  assert.equal(report.summary.runtimeFailures,0);
  assert.equal(report.summary.stateFailures,0);
  assert.equal(report.summary.sampled,19);
  assert.equal(coverage.observed,coverage.delivered+coverage.expiredUnserved+coverage.censored);
  assert.equal(coverage.eligibleForRate,coverage.delivered+coverage.expiredUnserved);
  const rows=Object.values(coverage.byEvent);
  for(const key of ['observed','delivered','expiredUnserved','censored'])
    assert.equal(rows.reduce((sum,row)=>sum+row[key],0),coverage[key]);
  assert(coverage.deliveryRatePercent===null||
    Math.abs(coverage.deliveryRatePercent+coverage.expiryRatePercent-100)<0.011);
  console.log(JSON.stringify({passed:true,physicalCapacity:full.selected.length,
    physicalOverflow:full.metrics.expiredUnserved,lateCapacity:late.selected.length,
    simulatedLives:report.summary.sampled,processedYears:report.summary.processedYears,
    deadlineCoverage:coverage}));
})().catch(error=>{console.error(error);process.exitCode=1;});
