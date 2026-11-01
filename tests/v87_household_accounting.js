'use strict';
const assert = require('node:assert/strict'),
  path = require('node:path'),
  vm = require('node:vm'),
  { context, setup } = require('./support/annual-cases.cjs'),
  root = path.resolve(__dirname, '..'),
  { ctx } = context(root);

function prepare(age, arrangement, infected = false) {
  setup(ctx, { id: 'household-accounting', seed: 905120 + age, region: 'カジミエーシュ', age });
  ctx.TEST_ARRANGEMENT = arrangement;
  ctx.TEST_INFECTED = infected;
  vm.runInContext(`(() => {
    const s = S;
    s.age = ${age};
    s.year = s.by + s.age;
    s.mo = 12;
    s.householdExitAge = 18;
    s.residenceArrangement = TEST_ARRANGEMENT;
    s.fl.household_separated = 0;
    s.fl.insured = 0;
    s.fl.tx = TEST_INFECTED ? 1 : 0;
    s.inf = TEST_INFECTED ? 1 : 0;
    s.ob = TEST_INFECTED ? 30 : 0;
    s.cash = 0;
    s.debt = 0;
    s.house.cash = 10000000;
    s.house.debt = 0;
    s.familyContribution = 0;
    s.job = 0;
    s.lifeRecord.careerChanges = [{ year: s.year - 1, from: 1, to: 0 }];
  })()`, ctx);
}

function settle() {
  return vm.runInContext(`(() => {
    const s = S, age = s.age, services = ANNUAL_SERVICES;
    settleAnnualHouseholdBudget(s, services, age);
    const householdLiving = s.house.flow.expense.living;
    const householdTreatment = s.house.flow.expense.treatment;
    const personalBudgetRecorded = applyAnnualPersonalBudget(s, services, age, s.t, s.f);
    return {
      householdLiving,
      householdTreatment,
      personalBudgetRecorded,
      personalLiving: s.flow?.expense?.living || 0,
      personalMedical: s.flow?.expense?.medical || 0,
      personalDebt: s.debt,
      householdCash: s.house.cash,
      annualFlow: s.flow
    };
  })()`, ctx);
}

prepare(15, 'family_home_shared_budget', true);
const shared = settle();
assert(shared.householdLiving > 0, 'the shared household should carry the youth living share');
assert(shared.householdTreatment > 0, 'the shared household should carry the youth treatment cost');
assert.equal(shared.personalLiving, 0, 'shared household living costs must not be charged to the youth again');
assert.equal(shared.personalMedical, 0, 'shared household treatment must not be charged to the youth again');
assert.equal(shared.personalDebt, 0, 'supported shared-household costs must not create personal debt');

prepare(15, 'family_home_separate_budget', true);
const separate = settle();
assert(separate.householdLiving < shared.householdLiving, 'a separate personal budget must remove the youth share from household living costs');
assert.equal(separate.householdTreatment, 0, 'a separate personal budget must leave youth treatment to the personal account');
assert(separate.personalLiving > 0, 'a separate personal budget must carry the youth living costs');
assert(separate.personalMedical > 0, 'a separate personal budget must carry the youth treatment costs');

prepare(14, 'family_home_separate_budget', true);
const minor = settle();
assert(minor.householdLiving > 0, 'before the personal budget begins, the upbringing household still carries living costs');
assert(minor.householdTreatment > 0, 'before the personal budget begins, the upbringing household still carries treatment');
assert.equal(minor.personalLiving, 0, 'the personal account is not opened before workStartAge');

prepare(16, 'family_home_separate_budget');
vm.runInContext('S.familyContribution = 0.15; S.cash = 5000000;', ctx);
const contributionState = vm.runInContext(`(() => {
  const s = S, services = ANNUAL_SERVICES;
  settleAnnualHouseholdBudget(s, services, s.age);
  const amounts = prepareAnnualPersonalBudget(s, services, s.age, s.t, s.f);
  amounts.inc = 1000000;
  const { tc, ex, annualFlow } = settleAnnualPersonalCash(s, services, amounts, s.age);
  finishAnnualPersonalBudget(s, services, amounts, tc, ex, annualFlow);
  return annualFlow.expense.familyContribution || 0;
})()`, ctx);
assert.equal(contributionState, 150000, 'the explicitly chosen contribution must reach the family home with separate accounts');

prepare(13, 'family_home_shared_budget');
const launch = vm.runInContext(`(() => {
  const event = EV.find(row => row.id === 'family_launch');
  return { separateNeed: event.c[1].show.need, deferredArrangement: event.c[2].o[0][2].residenceArrangement };
})()`, ctx);
assert(launch.separateNeed.includes('就労中'), 'separate accounts must require current work income');
assert.equal(launch.deferredArrangement, 'family_home_shared_budget', 'postponing the discussion must retain the current shared budget');

const debtPressure = vm.runInContext(`(() => {
  const s = S, capacity = P('economy.minimumExpenseBase') * s.res.pm * s.priceIndex;
  s.cash = 0; s.inc = capacity; s.debt = capacity;
  const oneYearOfIncome = annualDebtMoodPenalty(s, ANNUAL_SERVICES);
  s.debt = capacity * 1000;
  const longTermInsolvency = annualDebtMoodPenalty(s, ANNUAL_SERVICES);
  s.debt = 0; s.cash = 1000;
  const solvent = annualDebtMoodPenalty(s, ANNUAL_SERVICES);
  return { oneYearOfIncome, longTermInsolvency, solvent };
})()`, ctx);
assert(Math.abs(debtPressure.oneYearOfIncome - Math.log(2)) < 1e-9, 'debt pressure should scale with debt relative to annual capacity');
assert.equal(debtPressure.longTermInsolvency, 3, 'severe debt pressure should reach its documented cap');
assert.equal(debtPressure.solvent, 0, 'positive cash should offset personal debt before mood is affected');
const healthPressure = vm.runInContext(`(() => {
  const s = S;
  s.h = 30; const healthyThreshold = annualHealthMoodPenalty(s, ANNUAL_SERVICES);
  s.h = 15; const poorHealth = annualHealthMoodPenalty(s, ANNUAL_SERVICES);
  s.h = 0; const criticalHealth = annualHealthMoodPenalty(s, ANNUAL_SERVICES);
  return { healthyThreshold, poorHealth, criticalHealth };
})()`, ctx);
assert.equal(healthPressure.healthyThreshold, 0, 'the health penalty must start only below the critical threshold');
assert.equal(healthPressure.poorHealth, 1, 'health stress should scale with severity');
assert.equal(healthPressure.criticalHealth, 2, 'critical health should reach the documented annual cap');

prepare(35, 'individual');
const contractLedger = vm.runInContext(`(() => {
  const s=S;
  s.year=1120;s.cash=100000;s.debt=100000;s.loanContracts=[];
  const contract=addLoanContract(s,{
    contractId:'ledger-proof',borrower:'本人',creditor:'工業区の貸付人',
    region:'クルビア',currency:'モデル会計単位',account:'personal',
    principal:100000,totalDue:150000,installmentShare:.2,dueInYears:1,
    disbursement:'borrower',terms:'固定返済総額。一部返済可。'
  },1);
  const afterSignature={cash:s.cash,debt:s.debt,balance:contract.balance};
  const interest=accrueUncontractedDebtInterest(s,'personal',.1);
  const affordable=loanContractPaymentAffordable(s,contract.id,'installment');
  const paidAtEvent=payContractLoanFromCash(s,contract.id,'installment');
  const paidAnnual=settleContractDebt(s,'personal',20000);
  const charge=addContractLoanCharge(s,{contractId:contract.id,amount:'installment',reason:'契約外の追加請求',disputed:true},1);
  s.year=contract.dueYear+1;updateLoanContractStatuses(s);
  const beforeDeath={cash:s.cash,debt:s.debt,balance:contract.balance,interest,affordable,paidAtEvent,paidAnnual,charge,status:contract.status};
  const restored=JSON.parse(JSON.stringify(s));
  restored.dead=1;finalizeLoanContractsAtDeath(restored);
  return {afterSignature,beforeDeath,restored:{
    id:restored.loanContracts[0].id,balance:restored.loanContracts[0].balance,
    status:restored.loanContracts[0].status,debt:restored.debt,
    history:restored.loanContracts[0].history.map(row=>row.kind)
  }};
})()`,ctx);
assert.deepEqual(JSON.parse(JSON.stringify(contractLedger.afterSignature)),
  {cash:200000,debt:250000,balance:150000});
assert.equal(contractLedger.beforeDeath.interest,10000,'fixed contract debt is excluded from ordinary annual interest');
assert.equal(contractLedger.beforeDeath.affordable,true);
assert.equal(contractLedger.beforeDeath.paidAtEvent,30000);
assert.equal(contractLedger.beforeDeath.paidAnnual,20000);
assert.equal(contractLedger.beforeDeath.charge,30000);
assert.equal(contractLedger.beforeDeath.balance,130000);
assert.equal(contractLedger.beforeDeath.debt,240000,'aggregate debt must equal 110000 uncontracted plus 130000 contract balance');
assert.equal(contractLedger.beforeDeath.status,'overdue');
assert.equal(contractLedger.restored.balance,130000);
assert.equal(contractLedger.restored.debt,240000);
assert.equal(contractLedger.restored.status,'unresolved-at-death');
assert(contractLedger.restored.history.includes('payment'));
assert(contractLedger.restored.history.includes('disputed-charge'));


const householdContractLedger = vm.runInContext(`(() => {
  const s={year:1120,house:{cash:50000,debt:50000},loanContracts:[]};
  const contract=addLoanContract(s,{
    contractId:'household-ledger-proof',borrower:'世帯',creditor:'地域の工房',
    region:'テスト地域',currency:'モデル会計単位',account:'household',
    principal:20000,totalDue:30000,installmentShare:.5,dueInYears:2,
    terms:'固定返済総額。'
  },1);
  const paid=settleContractDebt(s,'household',10000);
  return {cash:s.house.cash,debt:s.house.debt,balance:contract.balance,paid};
})()`,ctx);
assert.deepEqual(JSON.parse(JSON.stringify(householdContractLedger)),
  {cash:50000,debt:70000,balance:20000,paid:10000},
  'household contract repayments must reduce the aggregate household balance exactly once');

console.log('PASS household and personal ledgers, contractual debt, uncontracted deficit interest, repayments, and death balance');

prepare(32,'independent');
const capacityAndDebt=vm.runInContext(`(()=>{
  S.job=2;S.fl.retired=0;S.debt=10000000;S.cash=0;S.w={...S.w,i:4};S.h=80;
  const budget=()=>prepareAnnualPersonalBudget(S,ANNUAL_SERVICES,S.age,S.t,S.f);
  const healthy=budget();S.h=0;const limited=budget(),travel=infectionCareTravelCostScale(S);
  S.h=80;const normalTravel=infectionCareTravelCostScale(S);
  ap({debtPlan:'frugal'});const frugal=budget();ap({debtPlan:'maintain'});const kept=budget();
  S.debt=2*Math.max(annualCashReserve(S),S.inc||0,S.exp||0);
  const event=EV.find(e=>e.id==='life_debt_budget_review');const T=tags(S);recordEventReview(event,S,'暮らしの支出を保つ');
  S.year+=4;S.age+=4;const same=elig(event,S,T);
  S.debt*=100;const changed=elig(event,S,T);
  const saved=JSON.parse(JSON.stringify(S));S.debtPlan.action='erase';const bad=auditLifeState(S).some(x=>x.includes('家計再建'));
  return {healthy:healthy.inc,limited:limited.inc,travel,normalTravel,
    frugal:frugal.baseExpense,kept:kept.baseExpense,debt:10000000,same,changed,
    saved:saved.debtPlan.action,bad};
})()`,ctx);
assert(capacityAndDebt.limited<capacityAndDebt.healthy,'health zero reduces actual earnings rather than acting as life remaining');
assert(capacityAndDebt.travel>capacityAndDebt.normalTravel,'low physical capacity raises assisted medical travel cost');
assert(capacityAndDebt.frugal<capacityAndDebt.kept,'a chosen debt plan changes actual living expense');
assert.equal(capacityAndDebt.same,false);assert.equal(capacityAndDebt.changed,true);
assert.equal(capacityAndDebt.saved,'maintain');assert.equal(capacityAndDebt.bad,true);
console.log('PASS physical work capacity, assisted travel, explicit debt budgeting and changed-burden review');

const mortalityCounts=vm.runInContext(`(()=>{
  resetSimulationStatistics();
  const life={dc:'天災による死亡',age:12,deathOrigin:'event'};recordSimulationDeath(life);
  recordSimulationDeath({dc:'病死（呼吸器の病）',age:15,deathOrigin:'annual'});
  recordSimulationDeath({dc:'天災',age:82,deathOrigin:'annual'});
  return {youngEvent:STAT.deathCohorts['under-18'].event['天災による死亡'],
    youngIllness:STAT.deathCohorts['under-18'].annual['病死（呼吸器の病）'],
    older:STAT.deathCohorts['50-plus'].annual['天災'],origins:{...STAT.deathOrigins}};
})()`,ctx);
assert.equal(mortalityCounts.youngEvent,1);assert.equal(mortalityCounts.youngIllness,1);assert.equal(mortalityCounts.older,1);
assert.deepEqual(JSON.parse(JSON.stringify(mortalityCounts.origins)),{event:1,annual:2});
console.log('PASS bounded age/cause/event-origin counters without running a cohort simulation');
