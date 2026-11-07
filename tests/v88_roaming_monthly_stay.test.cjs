'use strict';
const assert=require('node:assert/strict');
const path=require('node:path'),vm=require('node:vm');
const {context}=require('./support/annual-cases.cjs');
const {ctx}=context(path.resolve(__dirname,'..'));
function scenarios() {
  born({seed:10941011,by:1062,region:"クルビア"});
  const s=S;s.year=1094;s.mo=11;s.age=32;
  s.cash=40000000;s.residenceArrangement="independent_rental";
  s.fl.household_separated=1;
  const origin=s.res.n,to=(MIGRATION_ROUTES[origin]||[])
    .find(x=>(MIGRATION_ROUTES[x.n]||[]).some(y=>y.n===origin)).n;
  const trip=travelStart(s,{purpose:"wandering",destinationRegion:to,
    durationMonths:2,prepayReturn:true});
  const before=s.cash;
  travelDepart(s);
  const nov=s.travelState.transactions[trip.id+":stay:1094:11"];
  const fare=travelAnnualOutflow(s,1094,"personal","fare");
  advanceJourneyThrough(s,1094,12);
  const dec=s.travelState.transactions[trip.id+":stay:1094:12"];
  const afterDec=s.cash;
  advanceJourneyThrough(s,1094,12);
  const idempotent=s.cash===afterDec;
  s.travelState=JSON.parse(JSON.stringify(s.travelState));
  const jsonAudit=auditTravelState(s);
  advanceJourneyThrough(s,1095,1);
  const jan=s.travelState.transactions[trip.id+":stay:1095:1"];
  const reached=travelCurrentJourney(s).status;
  s.year=1095;s.mo=1;
  const beforeReturn=s.cash;
  travelBeginReturn(s);
  const noExtraReturn=s.cash===beforeReturn;
  const januaryCount=Object.values(s.travelState.transactions).filter(tx=>
    tx.kind==="stay"&&tx.year===1095&&tx.month===1).length;
  advanceJourneyThrough(s,1095,3);
  s.mo=3;
  travelEnd(s,"returned-home");
  const fiveMonthStay=Object.values(s.travelState.transactions).filter(x=>x.kind==="stay");
  const year1094=travelAnnualOutflow(s,1094,"personal","stay");
  const year1095=travelAnnualOutflow(s,1095,"personal","stay");
  const cashBeforeProjection=s.cash;
  s.flow={year:1095,expense:{},net:0};
  const projected=travelProjectAnnualOutflow(s,1095,"personal");
  const projection={...s.flow.expense,net:s.flow.net};
  const noDoubleCharge=s.cash===cashBeforeProjection;
  const firstAudit=auditTravelState(s);
  const originAfter=s.res.n;
  const moves=(s.moves||[]).length;

  born({seed:10941112,by:1062,region:"クルビア"});
  const needy=S;needy.year=1094;needy.mo=11;needy.age=32;
  needy.residenceArrangement="independent_rental";needy.fl.household_separated=1;
  needy.cash=30000000;
  const destination=(MIGRATION_ROUTES[needy.res.n]||[])[0].n;
  const journey=travelStart(needy,{purpose:"other",destinationRegion:destination});
  travelDepart(needy);
  needy.cash=0;
  advanceJourneyThrough(needy,1094,12);
  const unpaid=needy.travelState.transactions[journey.id+":stay:1094:12"];
  const debtRecord=needy.unpaidExpenses,insolvent=needy.fl.insolvent;
  const insufficientAudit=auditTravelState(needy);
  return {idempotent,nov,dec,jan,year1094,year1095,fare,
    arrival:reached,noExtraReturn,januaryCount,fiveMonthStay,
    projection,projected,noDoubleCharge,firstAudit,jsonAudit,
    originAfter,origin,moves,before,cashBeforeProjection,
    unpaid,debtRecord,insolvent,insufficientAudit};
}
const a=JSON.parse(vm.runInContext('JSON.stringify(('+scenarios.toString()+')())',ctx,{timeout:30000}));
assert.equal(a.idempotent,true);
assert.equal(a.nov.year,1094);assert.equal(a.nov.month,11);
assert.equal(a.dec.year,1094);assert.equal(a.dec.month,12);
assert.equal(a.jan.year,1095);assert.equal(a.jan.month,1);
assert.equal(a.arrival,"arrived");
assert.equal(a.noExtraReturn,true);
assert.equal(a.januaryCount,1);
assert.equal(a.fiveMonthStay.length,5);
assert(a.fiveMonthStay.every(tx=>tx.kind==="stay"&&tx.paid+tx.unpaid===tx.amount));
assert.equal(a.year1094,a.nov.amount+a.dec.amount);
assert.equal(a.year1095,a.fiveMonthStay.filter(tx=>tx.year===1095).reduce((v,x)=>v+x.amount,0));
assert.equal(a.projected,a.year1094+a.fare);
assert.equal(a.projection.travelFare,a.fare);
assert.equal(a.projection.travelStay,a.year1094);
assert.equal(a.projection.net,-a.projected);
assert.equal(a.noDoubleCharge,true);
assert.equal(a.originAfter,a.origin);assert.equal(a.moves,0);
assert.deepEqual(a.firstAudit,[]);assert.deepEqual(a.jsonAudit,[]);
assert.equal(a.unpaid.paid,0);
assert.equal(a.unpaid.unpaid,a.unpaid.amount);
assert.equal(a.debtRecord,a.unpaid.unpaid);
assert.equal(a.insolvent,1);
assert.deepEqual(a.insufficientAudit,[]);
console.log("PASS: monthly stay receipts across calendar year and JSON restore, no duplicate billing");
