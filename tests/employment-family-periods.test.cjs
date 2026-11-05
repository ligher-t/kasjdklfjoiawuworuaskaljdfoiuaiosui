'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const {context, setup} = require('./support/annual-cases.cjs');
const {ctx} = context(path.resolve(__dirname, '..'));
setup(ctx, {id: 'family-work-periods', seed: 20261106, region: 'クルビア', age: 40});
const run = code => JSON.parse(vm.runInContext('JSON.stringify((()=>{' + code + '})())', ctx));
const close = (a, b) => assert(Math.abs(a - b) < Math.max(0.001, Math.abs(b) * 1e-10), `${a} != ${b}`);
const periods = run(`
  S.year=1100;S.mo=1;S.priceIndex=1;
  const father={id:'father-work',j:2,d:0,workShare:1},
    child={id:'child-work',jobId:17,d:0,region:'クルビア',by:1075};
  recordDependentEmployment(S,father,{jobId:2,region:'クルビア',source:'initial-family-work'});
  S.mo=7;
  father.j=3;
  recordDependentEmployment(S,father,{jobId:3,region:'クルビア',source:'family-work-change'});
  recordDependentEmployment(S,child,{jobId:17,region:'クルビア',source:'adult-child-start'});
  const saved=JSON.stringify({S,rng:RANDOM_STATE}), fatherPay=dependentEmploymentAnnualIncome(S,father),
    childPay=dependentEmploymentAnnualIncome(S,child),
    expectedFather=(J[2].pay+J[3].pay)*0.5*S.res.pm,
    expectedChild=J[17].pay*0.5*S.res.pm;
  for(let i=0;i<4;i++) dependentEmploymentAnnualIncome(S,father);
  const readonly=JSON.stringify({S,rng:RANDOM_STATE})===saved;
  S.job=40;S.workPayBonus=0.75;S.fl.reduced_work=1;S.h=1;S.k=100;S.ar=100;
  const unaffected=dependentEmploymentAnnualIncome(S,father)===fatherPay;
  const noEmployer=father.employmentState.episodes.every(e=>e.siteId===null&&e.employerId===null);
  const row=recordDependentEmploymentPayment(S,father,{amount:fatherPay,recipientId:'parent-household',source:'settled'});
  recordDependentEmploymentPayment(S,father,{amount:fatherPay,recipientId:'parent-household',source:'settled'});
  let conflicting=false;
  try{recordDependentEmploymentPayment(S,father,{amount:fatherPay+1,recipientId:'parent-household',source:'settled'});}catch{conflicting=true;}
  const count=father.workEarningsLedger.length;
  closeDependentEmployment(S,father,'unemployed',{month:10});
  const ended=father.employmentState.episodes.at(-1), finalPay=dependentEmploymentAnnualIncome(S,father);
  let fabricated=false;
  try{recordDependentEmployment(S,{id:'blocked-relative',j:64},{jobId:64,region:'カジミエーシュ',source:'invalid'});}catch{fabricated=true;}
  return {fatherPay,childPay,expectedFather,expectedChild,readonly,unaffected,noEmployer,count,conflicting,
    finalPay,expectedFinal:(J[2].pay*0.5+J[3].pay*0.25)*S.res.pm,
    ended:ended.status,endMonth:ended.endMonth,fabricated,row};
`);
close(periods.fatherPay, periods.expectedFather);
close(periods.childPay, periods.expectedChild);
close(periods.finalPay, periods.expectedFinal);
for (const field of ['readonly', 'unaffected', 'noEmployer', 'conflicting', 'fabricated']) assert.equal(periods[field], true, field);
assert.equal(periods.count, 1);
assert.equal(periods.ended, 'terminated');
assert.equal(periods.endMonth, 10);

const vacancy = run(`
  S.year=1100;S.mo=3;
  const w=S.world.occupationWorld,siteId='family-slot-site',employerId='family-slot-employer',
    positionId='family-slot-position',openingId='family-slot-opening';
  w.employers[employerId]={employerId,organizationKey:null};
  w.sites[siteId]={siteId,employerId,status:'open',region:S.res.n};
  w.positions[positionId]={positionId,siteId,jobId:2,capacity:1,aggregateOccupiedSlots:0,
    identifiedOccupiedSlots:0,reservedSlots:0,vacancyCount:1};
  w.openings[openingId]={openingId,siteId,employerId,positionId,status:'open',slots:1,validFromYear:S.year};
  const hire={jobId:2,source:'recorded-family-offer',kind:'wage-employment',region:S.res.n,
    siteId,employerId,positionId,openingId,knownToPerson:true,selected:true,accepted:true,started:true},
    first={id:'first-worker',j:2},second={id:'second-worker',j:2};
  recordDependentEmployment(S,first,hire);
  recordDependentEmployment(S,first,hire);
  let secondRejected=false;
  try{recordDependentEmployment(S,second,hire);}catch{secondRejected=true;}
  const consumed=w.positions[positionId].identifiedOccupiedSlots,slots=w.openings[openingId].slots;
  closeDependentEmployment(S,first,'left');
  closeDependentEmployment(S,first,'left');
  return {secondRejected,consumed,slots,released:w.positions[positionId].identifiedOccupiedSlots,
    vacancies:w.positions[positionId].vacancyCount,episodes:first.employmentState.episodes.length};
`);
assert.deepEqual(vacancy, {secondRejected:true,consumed:1,slots:0,released:0,vacancies:1,episodes:1});

const household = run(`
  S.year=1101;S.mo=1;S.job=0;S.priceIndex=1;
  S.sp={id:'spouse-ledger',j:2,d:0,by:1070,employmentStatus:'employed',
    residenceRegion:'クルビア',sharesHousehold:true,householdArrangement:'shared',
    personalFinance:{status:'modeled_balance',startedYear:1101,expenseTier:2,
      cash:500000,debt:0,history:[],transfers:[],netChangeSinceStart:0}};
  recordDependentEmployment(S,S.sp,{jobId:2,region:'クルビア',source:'spouse-start'});
  const income=spouseGrossAnnualIncome(S), contribution=spouseHouseholdIncome(S),
    before=JSON.stringify(S.sp), rng=RANDOM_STATE;
  spouseHouseholdIncome(S);spouseGrossAnnualIncome(S);
  const quoteUnchanged=before===JSON.stringify(S.sp)&&rng===RANDOM_STATE;
  recordSpouseAnnualFinance(S,{income,contribution});
  const cash=S.sp.personalFinance.cash, count=S.sp.personalFinance.history.length;
  recordSpouseAnnualFinance(S,{income,contribution});
  const settledOnce=S.sp.personalFinance.cash===cash&&S.sp.personalFinance.history.length===count;
  S.sp.employmentStatus='unemployed';closeDependentEmployment(S,S.sp,'unemployed');
  const unemployed=spouseGrossAnnualIncome(S);
  return {quoteUnchanged,settledOnce,unemployed,
    contribution,expected:income*P('economy.spouseSharedHouseholdIncomeShare'),
    receipts:S.sp.workEarningsLedger.map(r=>({amount:r.amount,kind:r.kind}))};
`);
assert.equal(household.quoteUnchanged, true);
assert.equal(household.settledOnce, true);
assert.equal(household.unemployed, 0);
close(household.contribution, household.expected);
assert.equal(household.receipts.length, 2);
console.log('Family work periods, independent income and settled contribution provenance PASS');
