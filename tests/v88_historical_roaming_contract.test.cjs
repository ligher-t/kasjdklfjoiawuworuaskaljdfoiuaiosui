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
  S.cash=30000000;S.house.cash=30000000;
  S.residenceArrangement="family_home_shared_budget";
  S.fl.household_separated=0;
  const origin=S.res.n;
  const dest=MIGRATION_ROUTES[origin].find(x=>(MIGRATION_ROUTES[x.n]||[]).some(y=>y.n===origin)).n;
  const beforeMoves=(S.moves||[]).length;
  const planned=travelStart(S,{purpose:"wandering",destinationRegion:dest});
  const before=travelPresence(S);
  const householdBefore=S.house.cash;
  const personalBefore=S.cash;
  travelDepart(S);
  const firstFare=S.travelState.transactions[planned.legs[0].id+":fare"];
  const householdAfterOutbound=S.house.cash;
  const transit=travelPresence(S);
  advanceJourneyThrough(S,1099,6);
  const sameMonth=travelCurrentJourney(S).status;
  advanceJourneyThrough(S,1099,7);
  const arrived=travelPresence(S);
  let refused=false;
  try {travelEnd(S,"abandoned");}catch {refused=true;}
  S.mo=7;travelBeginReturn(S);
  const returnFare=S.travelState.transactions[planned.legs[1].id+":fare"];
  const householdAfterReturn=S.house.cash;
  advanceJourneyThrough(S,1099,8);
  const returned=travelPresence(S);
  travelEnd(S,"returned-home");
  const audit=auditTravelState(S);
  S.travelState=JSON.parse(JSON.stringify(S.travelState));
  const auditRestored=auditTravelState(S);
  S.mo=9;
  travelStart(S,{purpose:"flight",destinationRegion:dest});
  travelEnd(S,"abandoned");
  const householdTripExpense=travelAnnualOutflow(S,1099,"household");
  const individualTripExpense=travelAnnualOutflow(S,1099,"personal");
  // A separate adult itinerary uses the personal wallet. Failure must leave
  // both the planned journey and the account untouched.
  born({seed:109907,by:1067,region:"クルビア"});
  S.year=1099;S.age=32;S.mo=6;
  S.residenceArrangement="independent";
  S.fl.household_separated=1;
  S.cash=0;
  const destination=MIGRATION_ROUTES[S.res.n][0].n;
  const ownJourney=travelStart(S,{purpose:"work",destinationRegion:destination});
  let insufficient=false;
  try {travelDepart(S);}catch {insufficient=true;}
  const noDebit=Object.keys(S.travelState.transactions).length===0 &&
    ownJourney.status==="planned" && S.cash===0;
  S.cash=30000000;
  const ownCashBefore=S.cash;
  travelDepart(S);
  const ownTx=S.travelState.transactions[ownJourney.legs[0].id+":fare"];
  const ownCashAfter=S.cash;
  const blockedResidence=travelBlocksResidenceEvent({need:["国:クルビア"]},S);
  const globalAllowed=!travelBlocksResidenceEvent({need:["成人"]},S);
  advanceJourneyThrough(S,1099,7);
  travelBeginReturn(S);
  advanceJourneyThrough(S,1099,8);
  travelEnd(S,"returned-home");
  const cashBeforeProjection=S.cash;
  S.year=1100;
  S.flow={year:1100,expense:{},net:0};
  const reportedFare=travelProjectAnnualOutflow(S,1100,"personal");
  const noDoubleDebit=S.cash===cashBeforeProjection;
  const annualFare=S.flow.expense.travelFare;
  return {insufficient,noDebit,ownCashBefore,ownCashAfter,ownTx,
    blockedResidence,globalAllowed,reportedFare,noDoubleDebit,annualFare,
    hist:hist.length,timeline:events.length,
    missing:events.filter(e=>!e.historicalScene).map(e=>e.id),
    cases,origin,dest,beforeMoves,
    plannedNoCheckpoint:planned.legs[0].checkpointId,
    householdBefore,householdAfterOutbound,householdAfterReturn,personalBefore,firstFare,returnFare,
    travelExpense:householdTripExpense,personalTravelExpense:individualTripExpense,
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
assert.equal(r.insufficient,true);
assert.equal(r.noDebit,true);
assert.equal(r.ownTx.paidBy,"personal");
assert.equal(r.ownCashBefore-r.ownCashAfter,r.ownTx.amount);
assert.equal(r.blockedResidence,true);
assert.equal(r.globalAllowed,true);
assert.equal(r.noDoubleDebit,true);
assert.equal(r.annualFare,r.reportedFare);
assert(r.firstFare.amount > 0 && r.returnFare.amount > 0);
assert.equal(r.firstFare.paidBy,"household");
assert.equal(r.householdBefore-r.householdAfterOutbound,r.firstFare.amount);
assert.equal(r.householdAfterOutbound-r.householdAfterReturn,r.returnFare.amount);
assert.equal(r.travelExpense,r.firstFare.amount+r.returnFare.amount);
assert.equal(r.personalTravelExpense,0);
assert.equal(r.personalBefore,30000000);

const fatal = JSON.parse(vm.runInContext(`JSON.stringify((() => {
  born({seed:109908,by:1067,region:"クルビア"});
  S.year=1099;S.age=32;S.mo=6;
  S.cash=30000000;S.residenceArrangement="independent";
  S.fl.household_separated=1;
  const dest=MIGRATION_ROUTES[S.res.n][0].n;
  const trip=travelStart(S,{purpose:"flight",destinationRegion:dest});
  travelDepart(S);
  const lastPlace=travelPresence(S);
  die("事故死","街道を移動する途中で命を落とした");
  const closed=S.travelState.journeys[trip.id];
  return {dead:S.dead,journeyStatus:closed.status,
    reason:closed.conclusion?.reason,active:S.travelState.activeJourneyId,
    sourceMode:lastPlace.mode,location:S.deathTravel?.label,
    context:S.deathTravel?.journeyId,errors:auditLifeState(S)};
})())`,ctx,{timeout:20000}));
assert.equal(fatal.dead,1);
assert.equal(fatal.journeyStatus,"ended-by-death");
assert.equal(fatal.reason,"ended-by-death");
assert.equal(fatal.active,null);
assert.equal(fatal.sourceMode,"in-transit");
assert.match(fatal.location,/移動途上/);
assert.equal(fatal.context!=null,true);
assert.deepEqual(fatal.errors,[]);

console.log('PASS: historic scene, travel finance, actual return, and death closure');
