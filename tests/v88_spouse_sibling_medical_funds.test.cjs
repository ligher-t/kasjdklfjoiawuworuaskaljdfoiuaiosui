'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const { context, setup } = require('./support/annual-cases.cjs');

const { ctx } = context(path.resolve(__dirname, '..'));
const inspect = code => JSON.parse(vm.runInContext('JSON.stringify((()=>{' + code + '})())', ctx));

for (const shared of [false, true]) {
  setup(ctx, { id:'spouse-medical-reserve-'+shared,seed:194100+(shared?1:0),region:'ヴィクトリア',age:40 });
  ctx.SHARED = shared;
  const actual = inspect(`
    S.year=1100; S.age=40; S.priceIndex=1.15;
    S.residenceArrangement=SHARED?'spouse_shared':'independent_rental';
    S.fl.household_separated=1;
    S.sp={id:'medical-spouse',nm:'受診する配偶者',r:S.r,inf:1,infHidden:0,tx:0,
      careEverStarted:0,sharesHousehold:SHARED,residenceRegion:S.res.n};
    S.fl.spouse_supported=0;
    const original=EV.find(e=>e.id==='family_spouse_infection_care'),
      followup=EV.find(e=>e.id==='family_spouse_treatment_review'),
      begin=original.c[0],
      revisit=followup.c[0],
      restart=followup.c[4],
      cost=spouseInitialTreatmentCost(S),reserve=annualCashReserve(S);
    if(!S.house)S.house={cash:0,debt:0,inc:0,exp:0};
    const wallet=inSharedHousehold(S)?S.house:S;
    wallet.cash=cost+reserve-1;
    const insufficientOriginal=ok(begin.en,S,tags(S)),
      insufficientReview=ok(revisit.en,S,tags(S));
    wallet.cash=cost+reserve;
    const enoughOriginal=ok(begin.en,S,tags(S)),
      enoughReview=ok(revisit.en,S,tags(S)),
      cashBefore=wallet.cash;
    ap(begin.o[0][2]);
    const began={spent:cashBefore-wallet.cash,tx:S.sp.tx,
      ever:S.sp.careEverStarted,protagonistInf:S.inf||0};
    ap(followup.c[3].o[0][2]);
    const paused={tx:S.sp.tx,ever:S.sp.careEverStarted};
    wallet.cash=cost+reserve-1;
    const insufficientRestart=ok(restart.en,S,tags(S));
    wallet.cash=cost+reserve;
    const enoughRestart=ok(restart.en,S,tags(S)),
      beforeRestart=wallet.cash;
    ap(restart.o[0][2]);
    return {cost,reserve,insufficientOriginal,insufficientReview,
      enoughOriginal,enoughReview,began,paused,
      insufficientRestart,enoughRestart,restarted:{
        spent:beforeRestart-wallet.cash,tx:S.sp.tx,ever:S.sp.careEverStarted
      }};
  `);
  assert(actual.cost>0 && actual.reserve>0);
  assert.deepEqual({
    insufficientOriginal:actual.insufficientOriginal,
    insufficientReview:actual.insufficientReview,
    enoughOriginal:actual.enoughOriginal,enoughReview:actual.enoughReview,
    insufficientRestart:actual.insufficientRestart,enoughRestart:actual.enoughRestart
  },{insufficientOriginal:false,insufficientReview:false,
    enoughOriginal:true,enoughReview:true,insufficientRestart:false,enoughRestart:true},
    'initial and resumed spouse treatment require both fee and one year of living reserve');
  assert.deepEqual(actual.began,{spent:actual.cost,tx:1,ever:1,protagonistInf:0});
  assert.deepEqual(actual.paused,{tx:0,ever:1});
  assert.deepEqual(actual.restarted,{spent:actual.cost,tx:1,ever:1});
}

setup(ctx,{id:'sibling-medical-one-off',seed:194102,region:'クルビア',age:40});
const sibling = inspect(`
  S.year=1100; S.age=40; S.priceIndex=1.2;
  S.residenceArrangement='independent_rental';S.fl.household_separated=1;
  S.siblings=[
    {id:'sibling-ill',nm:'病院へ行くきょうだい',by:1070,independentSinceYear:1090,
      region:S.res.n,knownRegion:S.res.n,health:52,healthNoticeYear:1099,healthKnownYear:1090,
      contactState:'regular',contactReviewYear:1100,financialDebt:5000,financialCash:3000},
    {id:'sibling-other',nm:'別のきょうだい',by:1072,independentSinceYear:1090,
      region:S.res.n,knownRegion:S.res.n,health:80,contactState:'regular',
      financialDebt:0,financialCash:4000}
  ];S.legacySiblingCount=0;
  S.eventRelativeId='sibling-ill';
  const event=EV.find(e=>e.id==='family_sibling_contact'),
    aid=event.c[2],medical=event.c[3],reserve=annualCashReserve(S),
    aidCost=100000*S.res.pm*(S.priceIndex||1),
    medicalCost=siblingHealthAidCost(S);
  S.cash=aidCost+reserve-1;
  const beforeAid=ok(aid.en,S,tags(S));
  S.cash=medicalCost+reserve-1;
  const beforeMedical=ok(medical.en,S,tags(S));
  S.cash=Math.max(aidCost,medicalCost)+reserve;
  const readyAid=ok(aid.en,S,tags(S)),readyMedical=ok(medical.en,S,tags(S));
  const beforeCash=S.cash,priorOtherCash=S.siblings[1].financialCash;
  ap(medical.o[0][2]);
  const recipient=S.siblings[0],tx=recipient.financialTransfers.at(-1);
  return {aidCost,medicalCost,reserve,beforeAid,beforeMedical,readyAid,readyMedical,
    cashSpent:beforeCash-S.cash,aidReceived:recipient.lastHealthAidAmount,
    transferAmount:tx.amount,recipientDebt:recipient.financialDebt,recipientCash:recipient.financialCash,
    transferDebtPaid:tx.debtPayment,otherUnchanged:S.siblings[1].financialCash===priorOtherCash,
    protagonistHealth:S.h,treated:recipient.tx||0};
`);
assert(sibling.aidCost>0 && sibling.medicalCost>0 && sibling.reserve>0);
assert.equal(sibling.beforeAid,false);
assert.equal(sibling.beforeMedical,false);
assert.equal(sibling.readyAid,true);
assert.equal(sibling.readyMedical,true);
assert.equal(sibling.cashSpent,sibling.medicalCost,
  'one medical aid expenditure must equal the actual recipient-credit amount');
assert.equal(sibling.aidReceived,sibling.medicalCost);
assert.equal(sibling.transferAmount,sibling.medicalCost);
assert.equal(sibling.transferDebtPaid,5000,'incoming funds pay the sibling personal debt first');
assert.equal(sibling.recipientDebt,0);
assert.equal(sibling.recipientCash,3000+sibling.medicalCost-5000);
assert.equal(sibling.otherUnchanged,true,'unrelated siblings receive no money');
assert.equal(sibling.treated,0,'paying transport does not imply a new clinical treatment plan');

setup(ctx,{id:'sibling-annual-first-payment',seed:194103,region:'クルビア',age:40});
const annual=inspect(`
  S.year=1100;S.age=40;
  S.siblings=[{id:'sibling-care',nm:'支援されるきょうだい',by:1070,
    independentSinceYear:1091,region:S.res.n,knownRegion:S.res.n,
    inf:1,infKnown:1,contactState:'regular',financialTransfers:[],financialCash:0,
    financialDebt:0}];S.legacySiblingCount=0;
  S.eventRelativeId='sibling-care';
  const event=EV.find(e=>e.id==='family_sibling_contact'),
    option=event.c.find(c=>c.l.includes('毎年の薬代'));
  const before=S.siblings[0].financialTransfers.length;
  ap(option.o[0][2]);
  return {annual:S.siblings[0].careSupportAnnual,
    transfers:S.siblings[0].financialTransfers.length-before,
    resultText:option.o[0][1]};
`);
assert(annual.annual>0);
assert.equal(annual.transfers,0,'choosing annual support schedules future payments, not instant remittance');
assert.match(annual.resultText,/最初の送金日を決めた/);
assert.doesNotMatch(annual.resultText,/最初の仕送りを済ませた/);
console.log('PASS spouse medical reserves, sibling one-off payment and scheduled annual aid');
