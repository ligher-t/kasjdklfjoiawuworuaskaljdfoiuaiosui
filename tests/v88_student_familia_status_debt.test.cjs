'use strict';
const assert = require('node:assert/strict');
const vm = require('node:vm');
const path = require('node:path');
const {context,setup} = require('./support/annual-cases.cjs');
const {ctx} = context(path.resolve(__dirname, '..'));
const inspect = code => JSON.parse(vm.runInContext('JSON.stringify((()=>{' + code + '})())',ctx));

let seed=193010;
for (const outcomeIndex of [0,1]) {
  setup(ctx,{id:'siracusa-debt-still-member-'+outcomeIndex,seed:seed++,region:'シラクーザ',age:26});
  ctx.OUTCOME_INDEX=outcomeIndex;
  const actual=inspect(`
    S.year=1090;S.age=26;
    const entry=EV.find(e=>e.id==='sir_family');
    const obligation=EV.find(e=>e.id==='sir_family_obligation');
    const review=EV.find(e=>e.id==='sir_family_review');
    ap(entry.c[0].o[0][2]);
    ap({siracusaFamilyDuty:{action:'acceptedPressure',amount:90000,note:'実際の立替金'}});
    S.year=1092;S.age=28;
    const before=elig(obligation,S,tags(S));
    ap(obligation.c[1].o[OUTCOME_INDEX][2]);
    const a=S.lifeRecord.affiliations.find(x=>x.id==='siracusa-familia');
    const g=S.lifeRecord.goals.find(x=>x.id==='siracusa-family-livelihood');
    return {before,status:a.status,goal:g.status,tie:S.siracusaFamilyTie.status,
      flag:S.fl.family,amount:S.siracusaFamilyTie.duty.outstandingAmount,
      reviewLater:(S.year=S.siracusaFamilyTie.nextReviewYear,review.show(S))};
  `);
  assert.equal(actual.before,true,'a recorded debt becomes payable at its actual due year');
  assert.deepEqual({status:actual.status,goal:actual.goal,tie:actual.tie,flag:actual.flag,
      amount:actual.amount,reviewLater:actual.reviewLater},
    {status:'suspended',goal:'paused',tie:'distant',flag:0,
      amount:outcomeIndex===0?0:60000,reviewLater:true},
    'mediation pauses the member\'s work and goal without closing the independent debt');
}

for (const outcomeIndex of [0,1,2]) {
  setup(ctx,{id:'siracusa-debt-after-exit-'+outcomeIndex,seed:seed++,region:'シラクーザ',age:26});
  ctx.OUTCOME_INDEX=outcomeIndex;
  const actual=inspect(`
    S.year=1090;S.age=26;
    const entry=EV.find(e=>e.id==='sir_family'),
      obligation=EV.find(e=>e.id==='sir_family_obligation'),
      review=EV.find(e=>e.id==='sir_family_review');
    ap(entry.c[0].o[0][2]);
    ap({siracusaFamilyDuty:{action:'acceptedPressure',amount:90000,note:'実際の立替金'}});
    S.year=1091;S.age=27;
    ap(review.c[2].o[0][2]);
    const beforeGoal=S.lifeRecord.goals.find(x=>x.id==='siracusa-family-livelihood');
    const oldGoalHist=beforeGoal.history.length;
    const oldTieHist=S.siracusaFamilyTie.history.length;
    S.year=1092;S.age=28;
    const wasPayable=elig(obligation,S,tags(S));
    const fx=OUTCOME_INDEX===0?obligation.c[0].o[0][2]:
      obligation.c[1].o[OUTCOME_INDEX-1][2];
    ap(fx);
    const a=S.lifeRecord.affiliations.find(x=>x.id==='siracusa-familia');
    const g=S.lifeRecord.goals.find(x=>x.id==='siracusa-family-livelihood');
    return {wasPayable,member:a.status,goal:g.status,
      tie:S.siracusaFamilyTie.status,flag:S.fl.family,amount:S.siracusaFamilyTie.duty.outstandingAmount,
      unchangedGoalHistory:g.history.length===oldGoalHist,
      unchangedTieHistory:S.siracusaFamilyTie.history.length===oldTieHist,
      falseReview:review.show(S)};
  `);
  assert.deepEqual({wasPayable:actual.wasPayable,member:actual.member,goal:actual.goal,
      tie:actual.tie,flag:actual.flag,amount:actual.amount,
      unchangedGoalHistory:actual.unchangedGoalHistory,
      unchangedTieHistory:actual.unchangedTieHistory,falseReview:actual.falseReview},
    {wasPayable:true,member:'left',goal:'abandoned',tie:'left',flag:0,
      amount:[0,0,60000][outcomeIndex],unchangedGoalHistory:true,
      unchangedTieHistory:true,falseReview:false},
    'debt collection must not rejoin a person who has already left the family network');
}

setup(ctx,{id:'ursus-flag-does-not-override-membership',seed:seed++,region:'ウルサス',age:20});
const student=inspect(`
  S.year=1101;S.age=20;S.fl.ursus_student_assembly_active=1;
  const later=EV.find(e=>e.id==='life_ursus_student_assembly_later');
  S.sn.life_ursus_student_assembly_protest=1101;
  S.year=1107;S.age=26;
  const oldFlagWithoutMembership=elig(later,S,tags(S));
  ap({lifeAffiliation:{id:'ursus-student-assembly',title:'学生連合',action:'join'},
      lifeGoal:{id:'ursus-student-assembly',title:'旧友との連絡',action:'start'}});
  const active=elig(later,S,tags(S));
  ap({lifeAffiliation:{id:'ursus-student-assembly',action:'suspend'},
      lifeGoal:{id:'ursus-student-assembly',action:'pause'}});
  const staleFlagDuringPause=elig(later,S,tags(S));
  ap({lifeAffiliation:{id:'ursus-student-assembly',action:'leave'},
      lifeGoal:{id:'ursus-student-assembly',action:'abandon'}});
  const staleFlagAfterExit=elig(later,S,tags(S));
  ap({lifeAffiliation:{id:'ursus-student-assembly',action:'return'},
      lifeGoal:{id:'ursus-student-assembly',action:'continue'}});
  const resumed=elig(later,S,tags(S));
  return {oldFlagWithoutMembership,active,staleFlagDuringPause,staleFlagAfterExit,resumed};
`);
assert.deepEqual(student,{oldFlagWithoutMembership:false,active:true,
  staleFlagDuringPause:false,staleFlagAfterExit:false,resumed:true},
  'the later student contact follows actual membership despite a stale active flag');

// Outstanding balances must be paid and renegotiated from the current ledger,
// never from the amount of the original 90,000 payment obligation.
for (const followup of ['settle','mediate','dispute']) {
  setup(ctx,{id:'siracusa-recurring-balance-'+followup,seed:seed++,region:'シラクーザ',age:28});
  ctx.FOLLOWUP=followup;
  const actual=inspect(`
    S.year=1090;S.age=28;
    const entry=EV.find(e=>e.id==='sir_family'),
      debt=EV.find(e=>e.id==='sir_family_obligation');
    ap(entry.c[0].o[0][2]);
    ap({siracusaFamilyDuty:{action:'acceptedPressure',amount:90000,note:'立替金'}});
    S.year=1092;S.age=30;
    ap(debt.c[1].o[1][2]); // A 30,000 payment leaves 60,000 outstanding.
    const afterFirst=S.siracusaFamilyTie.duty.outstandingAmount;
    S.year=1094;S.age=32;S.priceIndex=1;S.cash=10000000;
    const available=elig(debt,S,tags(S));
    const fullChoice=debt.c[0],partialChoice=debt.c[1];
    const fullAvailable=ok(fullChoice.show,S,tags(S));
    let before=S.cash;
    if(FOLLOWUP==='settle') ap(fullChoice.o[0][2]);
    if(FOLLOWUP==='mediate') ap(partialChoice.o[1][2]);
    if(FOLLOWUP==='dispute') ap(debt.c[2].o[0][2]);
    const d=S.siracusaFamilyTie.duty,final=d.history.at(-1);
    const member=S.lifeRecord.affiliations.find(a=>a.id==='siracusa-familia');
    return {afterFirst,available,fullAvailable,spent:before-S.cash,
      balance:d.outstandingAmount,lastAmount:final.amount,
      lastAction:final.action,deadline:d.settleByYear,
      member:member.status};
  `);
  assert.equal(actual.afterFirst,60000);
  assert.equal(actual.available,true,'the remaining balance becomes due two years after mediation');
  assert.equal(actual.fullAvailable,true,'the full repayment eligibility uses the remaining balance');
  if(followup==='settle') assert.deepEqual(
    {spent:actual.spent,balance:actual.balance,lastAmount:actual.lastAmount,
      lastAction:actual.lastAction,member:actual.member},
    {spent:60000,balance:0,lastAmount:60000,lastAction:'settled',member:'suspended'},
    'repayment is exactly 60,000, not the original 90,000');
  if(followup==='mediate') assert.deepEqual(
    {spent:actual.spent,balance:actual.balance,lastAmount:actual.lastAmount,
      lastAction:actual.lastAction,deadline:actual.deadline},
    {spent:30000,balance:30000,lastAmount:30000,lastAction:'mediated',deadline:1096},
    'second 30,000 repayment leaves exactly 30,000 outstanding');
  if(followup==='dispute') assert.deepEqual(
    {spent:actual.spent,balance:actual.balance,lastAmount:actual.lastAmount,
      lastAction:actual.lastAction,deadline:actual.deadline,member:actual.member},
    {spent:0,balance:60000,lastAmount:60000,lastAction:'disputed',deadline:null,member:'left'},
    'refusing collection records the remaining disputed sum, not the original sum');
}

console.log('PASS Siracusa debt, affiliation and goal lifecycles; Ursus later-life membership gate');
