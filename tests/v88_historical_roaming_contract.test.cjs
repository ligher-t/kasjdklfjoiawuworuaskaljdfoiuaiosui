'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const {context} = require('./support/annual-cases.cjs');
const {ctx} = context(path.resolve(__dirname,'..'));
function run() {
  const events=EV.filter(e=>e.id.startsWith("timeline_"));
  const hist=HIST.filter(h=>h.flag);
  function check(id,region,city,year,month,active=true) {
    born({seed:101832,by:year-32,region});
    S.res=REG.find(x=>x.n===region);
    S.year=year;S.mo=month;S.age=32;
    S.local={...makeLocality(S.home,region),city};
    S.world.events=active?Object.fromEntries(hist.map(h=>[h.flag,h.y])):{};
    const e=events.find(x=>x.id===id);
    return {scene:historicalSceneEligibility(e,S).eligible,
      actual:elig(e,S,tags(S))};
  }
  const cases=[
    check("timeline_texas_family_purge","クルビア",null,1092,9),
    check("timeline_sui_1102","クルビア",null,1102,9),
    check("timeline_sui_1102","炎国",null,1102,9),
    check("timeline_world_1099","クルビア",null,1099,9),
    check("timeline_four_emperors_war","ヴィクトリア","ロンディニウム",1031,12),
    check("timeline_thelazia_dead_londinium","ヴィクトリア","ロンディニウム",1094,7),
    check("timeline_thelazia_dead_londinium","ヴィクトリア","ロンディニウム",1094,9),
    check("timeline_thelazia_dead_londinium","カズデル",null,1094,9),
    check("timeline_thelazia_dead_londinium","ヴィクトリア","ロンディニウム",1095,9),
    check("timeline_thelazia_dead_londinium","ヴィクトリア","ロンディニウム",1094,9,false)
  ];
  born({seed:109906,by:1067,region:"クルビア"});
  S.year=1099;S.age=32;S.mo=6;
  const origin=S.res.n;
  const dest=MIGRATION_ROUTES[origin].find(x=>(MIGRATION_ROUTES[x.n]||[]).some(y=>y.n===origin)).n;
  const beforeMoves=(S.moves||[]).length;
  const planned=travelStart(S,{purpose:"wandering",destinationRegion:dest});
  const before=travelPresence(S);
  travelDepart(S);
  const transit=travelPresence(S);
  advanceJourneyThrough(S,1099,6);
  const sameMonth=travelCurrentJourney(S).status;
  advanceJourneyThrough(S,1099,7);
  const arrived=travelPresence(S);
  let refused=false;
  try {travelEnd(S,"abandoned");}catch {refused=true;}
  S.mo=7;travelBeginReturn(S);
  advanceJourneyThrough(S,1099,8);
  const returned=travelPresence(S);
  travelEnd(S,"returned-home");
  const audit=auditTravelState(S);
  S.travelState=JSON.parse(JSON.stringify(S.travelState));
  const auditRestored=auditTravelState(S);
  S.mo=9;
  travelStart(S,{purpose:"flight",destinationRegion:dest});
  travelEnd(S,"abandoned");
  return {
    hist:hist.length,timeline:events.length,
    missing:events.filter(e=>!e.historicalScene).map(e=>e.id),
    cases,origin,dest,beforeMoves,
    plannedNoCheckpoint:planned.legs[0].checkpointId,
    before,transit,sameMonth,arrived,refused,returned,audit,
    auditRestored, afterMoves:(S.moves||[]).length, actualHome:S.res.n,
    active:S.travelState.activeJourneyId
  };
}
const r=JSON.parse(JSON.stringify(vm.runInContext('('+run.toString()+')()',ctx)));
assert.equal(r.hist,37);
assert.equal(r.timeline,40);
assert.deepEqual(r.missing,[]);
r.cases.forEach((c,i)=>assert.equal(c.actual,i===6,'historical event index '+i));
assert.equal(r.plannedNoCheckpoint,null);
assert.equal(r.before.mode,'residence');
assert.equal(r.transit.mode,'in-transit');
assert.equal(r.transit.region,null);
assert.equal(r.sameMonth,'en-route');
assert.equal(r.arrived.mode,'stop');
assert.equal(r.arrived.region,r.dest);
assert.equal(r.refused,true);
assert.equal(r.returned.region,r.origin);
assert.equal(r.afterMoves,r.beforeMoves);
assert.equal(r.actualHome,r.origin);
assert.deepEqual(r.audit,[]);
assert.deepEqual(r.auditRestored,[]);
assert.equal(r.active,null);
console.log('PASS: 40 timeline scenes, dated locality and roaming without teleportation');
