'use strict';
const assert = require('node:assert/strict');
const vm = require('node:vm');
const path = require('node:path');
const {context, setup} = require('./support/annual-cases.cjs');
const {ctx} = context(path.resolve(__dirname, '..'));
setup(ctx, {id:'employment-finance', seed:20261105, region:'クルビア', age:25});
const result = JSON.parse(vm.runInContext(`JSON.stringify((()=>{
  S.job=0; S.mo=2; S.cash=100000000; S.debt=0; S.fl.sch=0;
  S.fl.household_separated=1; S.residenceArrangement='independent_rental';
  S.educationPath=null; S.educationDecision=null;
  const year=S.year, initialCash=S.cash, area=occupationAreaSnapshot(S), work=S.world.occupationWorld;
  const siteId='payroll-fixture-site', positionId='payroll-fixture-position',
    openingId='payroll-fixture-opening', employerId='payroll-fixture-employer';
  work.employers[employerId]={employerId,organizationKey:null};
  work.sites[siteId]={siteId,employerId,areaId:area.areaId,status:'open',sector:'MFG',positionIds:[positionId]};
  work.positions[positionId]={positionId,siteId,jobId:2,capacity:1,aggregateOccupiedSlots:0,
    identifiedOccupiedSlots:0,reservedSlots:0,vacancyCount:1,openingIds:[openingId]};
  work.openings[openingId]={openingId,siteId,positionId,employerId,areaId:area.areaId,
    status:'open',slots:1,validFromYear:year};
  area.siteIds.push(siteId);
  const opening=employmentOpeningForChoice(S,2,openingId);
  if (!opening) throw Error('fixture must allow the actual hiring action');
  ap({employmentAction:{action:'accept-local-opening',jobId:2,openingId:opening.openingId}});
  settleEmploymentThrough(S,year,1);
  const noPrehirePay=S.cash===initialCash;
  S.mo=4;
  settleEmploymentThrough(S,year,3);
  const wages=employmentPaidForYear(S,year), firstCash=S.cash;
  settleEmploymentThrough(S,year,3);
  const stable=S.cash===firstCash;
  applyPlayerEmploymentAction(S,{action:'suspend',reason:'treatment'});
  S.mo=6;
  applyPlayerEmploymentAction(S,{action:'resume',reason:'returned'});
  const noLeavePay=employmentPaidForYear(S,year)===wages;
  const ep=currentPlayerEmployment(S);
  ep.paymentStatus='withheld';
  S.mo=7;
  settleEmploymentThrough(S,year,6);
  const unpaid=employmentUnpaidAmount(S,ep.episodeId), beforeArrears=S.cash;
  payEmploymentArrears(S,ep.episodeId); payEmploymentArrears(S,ep.episodeId);
  const arrearsOnce=S.cash-beforeArrears, paid=employmentPaidForYear(S,year);
  endPlayerEmployment(S,'test-quit');
  settleEmploymentThrough(S,year,12);
  const noPayAfterExit=employmentPaidForYear(S,year)===paid;
  S.year++; S.mo=0;
  const amounts=prepareAnnualPersonalBudget(S,ANNUAL_SERVICES,S.age,S.t,S.f),
    before=S.cash, out=settleAnnualPersonalCash(S,ANNUAL_SERVICES,amounts,S.age),
    cashDelta=S.cash-before;
  return {noPrehirePay,wages,stable,noLeavePay,unpaid,arrearsOnce,paid,noPayAfterExit,
    projected:amounts.prepaidEmploymentIncome,annualNet:out.annualFlow.net,cashDelta};
})())`, ctx, {timeout:15000}));
assert(result.noPrehirePay);
assert(result.wages > 0);
assert(result.stable);
assert(result.noLeavePay);
assert(result.unpaid > 0);
assert(Math.abs(result.unpaid-result.arrearsOnce)<0.001);
assert(result.noPayAfterExit);
assert.equal(result.projected,result.paid);
assert(Math.abs(result.annualNet-result.cashDelta-result.paid)<0.001,'annual cash settlement must not pay monthly receipts again');
console.log('Employment pay periods, leave, arrears and annual projection PASS');

for (const [region, entryId, mealId, wallet] of [
  ['サーミ','car_sam_priest_entry','work_w11_community_bowl','personal'],
  ['クルビア','fam_inherit','work_family_shop_in_kind','household']
]) {
  setup(ctx,{id:'employment-meal',seed:20261105,region,age:22});
  ctx.MEAL_CASE={entryId,mealId,wallet};
  const meal=JSON.parse(vm.runInContext(`JSON.stringify((()=>{
    const {entryId,mealId,wallet}=MEAL_CASE, find=id=>EV.find(e=>e.id===id);
    S.job=0;S.mo=5;S.fl.sch=0;S.educationPath=null;S.educationDecision=null;
    S.fl.household_separated=wallet==='personal'?1:0;
    S.residenceArrangement=wallet==='personal'?'independent_rental':'family_home_shared_budget';
    if(wallet==='household') { S.par.fa.d=0;S.par.fa.j=5; }
    const event=find(mealId), beforeEntry=event.show(S);
    ap(find(entryId).c[0].o[0][2]);
    const offered=event.show(S), cash=S.cash, houseCash=S.house.cash, year=S.year;
    ap(event.c[1].o[0][2]);
    const declineUnchanged=event.show(S) && !employmentMealOffset(S,year,wallet);
    ap(event.c[0].o[0][2]);
    const cashUnchanged=S.cash===cash && S.house.cash===houseCash;
    const blocked=!event.show(S) && !employmentEffectAssessment(S,event.c[0].o[0][2]).canStart;
    const saved=cont(makeResumeSnapshot()), offset=employmentMealOffset(S,year,wallet);
    const otherOffset=employmentMealOffset(S,year,wallet==='personal'?'household':'personal');
    const projectedWages=employmentPaidForYear(S,year,wallet);
    S.year++;S.mo=0;
    const withoutMeal=JSON.parse(JSON.stringify(S));
    withoutMeal.employmentState.finance.meals=[];
    let difference;
    if (wallet==='personal') {
      const living=s=>prepareAnnualPersonalBudget(s,ANNUAL_SERVICES,s.age,s.t,s.f).baseExpense;
      difference=living(withoutMeal)-living(S);
    } else {
      settleAnnualHouseholdBudget(withoutMeal,ANNUAL_SERVICES,withoutMeal.age);
      settleAnnualHouseholdBudget(S,ANNUAL_SERVICES,S.age);
      difference=withoutMeal.house.flow.expense.living-S.house.flow.expense.living;
    }
    return {beforeEntry,offered,declineUnchanged,cashUnchanged,blocked,saved,offset,otherOffset,projectedWages,difference};
  })())`,ctx,{timeout:15000}));
  assert(!meal.beforeEntry && meal.offered, `${mealId} must require its actual livelihood`);
  assert(meal.declineUnchanged && meal.cashUnchanged && meal.blocked && meal.saved);
  assert(meal.offset>0 && Math.abs(meal.difference-meal.offset)<0.001);
  assert.equal(meal.otherOffset,0);
  assert.equal(meal.projectedWages,0);
}
console.log('Community and family work meals, save and separate annual budgets PASS');

setup(ctx,{id:'employment-secondment',seed:20261105,region:'クルビア',age:25});
const posting=JSON.parse(vm.runInContext(`JSON.stringify((()=>{
  const find=id=>EV.find(e=>e.id===id);
  S.job=0;S.mo=2;S.fl.sch=0;S.educationPath=null;S.educationDecision=null;
  ensureOccupationWorkArea(S);
  recordEmploymentAppointmentEncounter(S,'sr_bsw_recruitment_assessment');
  ap(find('sr_bsw_recruitment_assessment').c[0].o[0][2]);
  ap(find('sr_bsw_promotion_tactical').c[0].o[0][2]);
  const episode=currentPlayerEmployment(S),id=episode.episodeId,payer=episode.employerId;
  S.mo=4;ap(find('sr_bsw_rhodes_secondment').c[0].o[0][2]);
  const onBoard=episode.postingSiteId==='appointment-site:rhodes-staff' &&
    S.residenceBase?.id==='rhodes-landship' && S.workContract.episodeId===id;
  S.mo=5;settleEmploymentThrough(S,S.year,4);
  const monthly=employmentFinance(S).claims.filter(row=>row.year===S.year && row.month===4 && row.amount>0);
  const snapshot=makeResumeSnapshot();
  const restored=cont(snapshot) && currentPlayerEmployment(S)?.postingSiteId==='appointment-site:rhodes-staff';
  ap(find('sr_bsw_secondment_posting_review').c[1].o[0][2]);
  return {onBoard,restored,monthly:monthly.map(row=>({employerId:row.employerId,worksiteId:row.worksiteId})),payer,
    returned:currentPlayerEmployment(S)?.episodeId===id && !currentPlayerEmployment(S)?.postingSiteId};
})())`,ctx,{timeout:15000}));
assert(posting.onBoard);
assert(posting.restored);
assert.deepEqual(posting.monthly,[{employerId:posting.payer,worksiteId:'appointment-site:rhodes-staff'}]);
assert(posting.returned);
