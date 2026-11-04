'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const vm=require('node:vm');
const {context}=require('./support/annual-cases.cjs');
const {ctx}=context(path.resolve(__dirname,'..'));
function scenario(){
  born({seed:1094400,by:1062,region:"クルビア"});
  const s=S;
  s.year=1094;s.mo=4;s.age=32;s.cash=30000000;
  s.residenceArrangement="independent";s.fl.household_separated=1;
  const from=s.res.n, destination=(MIGRATION_ROUTES[from]||[])
    .find(x=>(MIGRATION_ROUTES[x.n]||[]).some(y=>y.n===from)).n;
  const travelPanel={innerHTML:"",textContent:""};
  renderTravelControls(s,{
    document:{getElementById:id=>id==="travel-controls"?travelPanel:null},
    esc: x=>String(x),m:x=>String(x)
  });
  const menu=travelPanel.innerHTML;
  HL=1; // No real browser log, redraw, or persistence during the test.
  const planned=travelControlAction("plan",{
    purpose:"wandering",destinationRegion:destination,durationMonths:1
  });
  const journey=travelCurrentJourney(s);
  const reserved=journey.returnReservation?.status;
  const cost=travelLegFareQuote(s,from,destination).amount+
    travelLegFareQuote(s,destination,from).amount;
  const before=s.cash;
  const departed=travelControlAction("depart");
  const after=s.cash;
  const spent=travelAnnualOutflow(s,1094,"personal");
  const departureStay=travelAnnualOutflow(s,1094,"personal","stay");
  const receipts=Object.values(s.travelState.transactions).map(x=>x.legId);
  // The exact save transport is JSON. It must retain the return ticket.
  s.travelState=JSON.parse(JSON.stringify(s.travelState));
  const auditAfterRestore=auditTravelState(s);
  const travelResidence=s.res.n;
  const blockedMove=travelBlocksResidenceEvent({c:[{o:[[1,"x",{resTo:destination}]]}]},s);
  const yearBefore=travelHomeWorkIncomeShare(s,1093);
  s.mo=5;advanceJourneyThrough(s,1094,5);
  const reached=travelCurrentJourney(s).status;
  const beforeReturn=s.cash;
  const canReturn=travelControlAction("return");
  const afterReturn=s.cash;
  const receiptCountAfterReturn=Object.keys(s.travelState.transactions).length;
  const totalStayAfterReturn=travelAnnualOutflow(s,1094,"personal","stay");
  s.mo=6;advanceJourneyThrough(s,1094,6);
  const finished=travelControlAction("finish");
  const moves=(s.moves||[]).length,finalResidence=s.res.n,active=s.travelState.activeJourneyId;
  const audit=auditTravelState(s);
  HL=0;

  born({seed:1094401,by:1062,region:"クルビア"});
  const poor=S;poor.year=1094;poor.mo=4;poor.age=32;
  poor.residenceArrangement="independent";poor.fl.household_separated=1;
  const dest=(MIGRATION_ROUTES[poor.res.n]||[])
    .find(x=>(MIGRATION_ROUTES[x.n]||[]).some(y=>y.n===poor.res.n)).n;
  const total=travelLegFareQuote(poor,poor.res.n,dest).amount+
    travelLegFareQuote(poor,dest,poor.res.n).amount;
  poor.cash=total-1;
  const p=travelStart(poor,{purpose:"wandering",destinationRegion:dest,prepayReturn:true});
  let insufficient=false;try{travelDepart(poor);}catch{insufficient=true;}
  return {menu,planned,reserved,departed,before,after,cost,spent,departureStay,receipts,
    travelResidence,blockedMove,yearBefore,reached,canReturn,afterReturn,beforeReturn,totalStayAfterReturn,
    receiptCountAfterReturn,auditAfterRestore,
    finished,moves,finalResidence,from,destination,active,audit,
    insufficient,poorStatus:p.status,poorCash:poor.cash,poorTransactions:
      Object.keys(poor.travelState.transactions).length,total};
}
const r=JSON.parse(vm.runInContext('JSON.stringify(('+scenario.toString()+')())',ctx,{timeout:30000}));
assert(r.menu.includes('travel-destination')&&r.menu.includes('travelControlAction'));
assert(r.menu.includes('行程を計画する'));
assert.equal(r.planned,true);
assert.equal(r.reserved,"pending");
assert.equal(r.departed,true);
assert.equal(r.before-r.after,r.cost+r.departureStay,'both fares and first-month stay are paid at departure');
assert.equal(r.spent,r.cost,'each fare is in the payment year');
assert.equal(new Set(r.receipts).size,2);
assert.equal(r.travelResidence,r.from);
assert.equal(r.blockedMove,true);
assert.equal(r.yearBefore,1);
assert.equal(r.reached,"arrived");
assert.equal(r.canReturn,true);
assert.equal(r.afterReturn,r.beforeReturn,'prepaid return is not charged twice');
assert.equal(r.receiptCountAfterReturn,4,'two fare receipts and two different monthly stay receipts');
assert.deepEqual(r.auditAfterRestore,[]);
assert.equal(r.finished,true);
assert.equal(r.moves,0);
assert.equal(r.finalResidence,r.from);
assert.equal(r.active,null);
assert.deepEqual(r.audit,[]);
assert.equal(r.insufficient,true);
assert.equal(r.poorStatus,"planned");
assert.equal(r.poorCash,r.total-1);
assert.equal(r.poorTransactions,0,'payment must be atomic');
console.log("PASS: player travel panel and prepaid round-trip with no forced relocation");
