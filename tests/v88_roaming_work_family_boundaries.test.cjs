'use strict';
const assert = require('node:assert/strict');
const vm = require('node:vm');
const path = require('node:path');
const {context} = require('./support/annual-cases.cjs');
const {ctx} = context(path.resolve(__dirname,'..'));
function scenarios() {
  born({seed:110401,by:1062,region:"クルビア"});
  const s=S;
  s.year=1094;s.age=32;s.mo=3;s.job=2;
  s.residenceArrangement="independent";s.fl.household_separated=1;s.cash=30000000;
  const site=activeFacility(s,"workplace");
  const contractBefore=reconcileWorkContract(s);
  const destination=(MIGRATION_ROUTES[s.res.n]||[]).find(x=>
    (MIGRATION_ROUTES[x.n]||[]).some(y=>y.n===s.res.n)).n;
  travelStart(s,{purpose:"work",destinationRegion:destination});
  travelDepart(s);
  const contractDuring=reconcileWorkContract(s);
  advanceJourneyThrough(s,1094,4);
  s.mo=4;travelBeginReturn(s);
  advanceJourneyThrough(s,1094,5);
  s.mo=5;travelEnd(s,"returned-home");
  const share=travelHomeWorkIncomeShare(s,1094);
  const noFutureAbsence=travelHomeWorkIncomeShare(s,1095);
  const returnContract=reconcileWorkContract(s);
  const saved=JSON.parse(JSON.stringify(s.travelState));
  s.year=1095;s.age=33;s.mo=0;
  const annualWithTravel=prepareAnnualPersonalBudget(s,ANNUAL_SERVICES,s.age,s.t,0).inc;
  s.travelState=null;
  const annualAllHome=prepareAnnualPersonalBudget(s,ANNUAL_SERVICES,s.age,s.t,0).inc;
  s.travelState=saved;

  born({seed:110402,by:1062,region:"クルビア"});
  const f=S;f.year=1094;f.age=32;f.mo=6;f.cash=30000000;
  f.residenceArrangement="independent";f.fl.household_separated=1;
  f.kids=[{id:"dependent-a",nm:"子",by:1085,d:0,householdStatus:"supported"}];
  const to=(MIGRATION_ROUTES[f.res.n]||[])[0].n;
  let noCaretaker=false;
  try {travelStart(f,{purpose:"family",destinationRegion:to});}
  catch {noCaretaker=true;}
  const noUnapprovedJourney=!travelCurrentJourney(f);
  f.sp={id:"partner-a",nm:"伴侶",d:0,sharesHousehold:true,residenceRegion:f.res.n};
  const spousePresent=spouseLivesWithProtagonist(f);
  let agreement=null,repeat=null,requiresAgreement=false,careJourney=null,guardsDeparture=false;
  if (spousePresent) {
    agreement=travelFamilyCareAgreement(f);
    repeat=travelFamilyCareAgreement(f);
    try{travelStart(f,{purpose:"family",destinationRegion:to});}
    catch{requiresAgreement=true;}
    if(agreement.status==="granted"){
      careJourney=travelStart(f,{purpose:"family",destinationRegion:to,
        familyCareAgreementId:agreement.id});
      // The spouse's departure or death after planning revokes authority.
      f.sp.d=1094;
      try{travelDepart(f);}catch{guardsDeparture=true;}
      f.sp.d=0;
      travelDepart(f);
    } else {
      try{travelStart(f,{purpose:"family",destinationRegion:to,
        familyCareAgreementId:agreement.id});}
      catch{guardsDeparture=true;}
    }
  }
  return {site:site?.id||null,contractBefore:contractBefore?.siteId||null,
    contractDuring:contractDuring?.siteId||null,returnContract:returnContract?.siteId||null,
    share,noFutureAbsence,annualWithTravel,annualAllHome,workAudit:auditTravelState(s),
    noCaretaker,noUnapprovedJourney,spousePresent,
    status:agreement?.status||null,
    repeatSame:agreement===repeat,requiresAgreement,
    guardsDeparture,careStatus:careJourney?.status||null,
    childrenRemain:f.kids[0].householdStatus,
    spouseRegion:f.sp.residenceRegion,homeRegion:f.res.n,
    careIds:careJourney?.householdCare?.childIds||[]};
}
const r=JSON.parse(vm.runInContext('JSON.stringify(('+scenarios.toString()+')())',ctx,{timeout:30000}));
assert.equal(r.share,9/12,'absence from March through May is three months');
assert.equal(r.noFutureAbsence,1);
assert(r.annualWithTravel<r.annualAllHome,'home-bound wage component is reduced');
assert.deepEqual(r.workAudit,[]);
assert.equal(r.contractDuring,r.contractBefore,'temporary travel must retain current job contract');
assert.equal(r.returnContract,r.contractBefore);
assert.equal(r.noCaretaker,true);
assert.equal(r.noUnapprovedJourney,true);
assert.equal(r.spousePresent,true);
assert(["granted","refused"].includes(r.status));
assert.equal(r.repeatSame,true,'consent status is stable for the same family-year');
assert.equal(r.requiresAgreement,true);
assert.equal(r.guardsDeparture,true);
assert.equal(r.childrenRemain,"supported");
assert.equal(r.spouseRegion,r.homeRegion);
if(r.status==="granted"){
  assert.equal(r.careStatus,"en-route");
  assert.deepEqual(r.careIds,["dependent-a"]);
}
console.log('PASS: work absence and verified dependent care across travel boundaries');
