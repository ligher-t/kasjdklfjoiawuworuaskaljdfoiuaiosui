'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const {context,setup} = require('./support/annual-cases.cjs');
const {ctx} = context(path.resolve(__dirname,'..'));
const inspect = src => JSON.parse(vm.runInContext('JSON.stringify((()=>{' + src + '})())',ctx));
const close = (actual,expected,label) =>
  assert(Math.abs(actual-expected) < Math.max(0.001,Math.abs(expected)*1e-10),
    label + ' actual=' + actual + ' expected=' + expected);

setup(ctx,{id:'parent-annual-and-child-budget-date',seed:194611,region:'ヴィクトリア',age:40});
const actual=inspect(`
  S.year=1100; S.age=40; S.priceIndex=1.27;
  S.residenceArrangement='independent_rental';S.fl.household_separated=1;
  S.job=5;S.cash=100000000;S.debt=0;S.fl.retired=0;S.fl.insured=0;
  S.kids=[{
    id:'independent-remittance',nm:'別居した子',by:1073,d:0,
    householdStatus:'independent',independentSinceYear:1098,
    region:S.res.n,knownRegion:S.res.n,jobId:4,
    remittanceAnnual:P('economy.childRemittanceAnnualCost'),
    moveReviewYear:9999,contactReviewYear:9999,contactState:'regular',
    budgetHistory:[]
  }];
  ensureLocalityState(S);
  S.community.metrics.food=0.03;S.community.metrics.housing=0.03;
  const oldPrice=S.priceIndex;
  advanceAnnualCalendar(S,ANNUAL_SERVICES);
  advanceAnnualRelationsAndAccess(S,ANNUAL_SERVICES);
  const local=localityLivingMultiplier(S),newPrice=S.priceIndex,
    independent=S.kids[0],recipient=independent.budgetHistory.at(-1),
    expectedReceipt=independent.remittanceAnnual*S.res.pm*newPrice*local;
  S.kids.push(
    {id:'student',nm:'進学した子',by:1080,d:0,householdStatus:'study',
      studyEndYear:1110,householdResidencePlan:'self',inf:1,tx:1,careSupport:1},
    {id:'dependent',nm:'扶養中の子',by:1088,d:0,householdStatus:'supported',
      householdResidencePlan:'self',inf:1,tx:0,careSupport:1},
    {id:'former-household-child',nm:'元配偶者側の子',by:1090,d:0,
      householdStatus:'supported',householdResidencePlan:'former_support',
      otherParentId:'former-marriage',inf:0}
  );
  S.relationshipHistory=[{id:'former-marriage',ending:'離婚',
      knownResidenceRegion:'龍門',residenceRegion:'龍門'}];
  S.siblings=[{id:'separate-infected-sibling',nm:'別居のきょうだい',by:1070,
    independentSinceYear:1090,inf:1,infKnown:1,d:0,
    careSupportAnnual:P('economy.siblingInfectionSupportAnnualCost'),
    financialCash:0,financialDebt:3000,financialTransfers:[]}];
  S.legacySiblingCount=0;
  S.sp={id:'separate-spouse',nm:'別居の配偶者',d:0,by:1071,inf:1,
    infHidden:0,tx:1,sharesHousehold:false,residenceRegion:S.res.n,
    separateSupportPlan:'medical',separateContact:'letters',
    personalFinance:{status:'modeled_balance',startedYear:1099,expenseTier:2,
      cash:0,debt:0,history:[],transfers:[],netChangeSinceStart:0}};
  const amounts=prepareAnnualPersonalBudget(S,ANNUAL_SERVICES,S.age,S.t,S.f),
    planned=childHouseholdFinances(S,amounts.costPm,S.res.pm),
    initialCash=S.cash;
  const settled=settleAnnualPersonalCash(S,ANNUAL_SERVICES,amounts,S.age);
  recordAnnualFamilyPayments(S,ANNUAL_SERVICES,amounts);
  const flow=S.flow,
    sibling=S.siblings[0],receipt=S.sp.personalFinance.supportReceipts?.at(-1),
    totalIncome=Object.values(flow.income).reduce((a,b)=>a+(Number(b)||0),0),
    totalExpense=Object.values(flow.expense).reduce((a,b)=>a+(Number(b)||0),0);
  return {
    oldPrice,newPrice,local,year:S.year,recipientYear:recipient?.year,
    expectedReceipt,received:recipient?.support,childRemit:amounts.childRemittanceCost,
    childEducation:amounts.childStudyCost,childLiving:amounts.childCost,
    childMedicalTravel:amounts.childCareTravel,childHousing:amounts.childHousingCost,
    divorceSupport:amounts.divorceChildSupportCost,spouseSupport:amounts.spouseSeparateSupport,
    siblingSupport:amounts.siblingCareSupportCost,
    planned,flow,initialCash,afterCash:S.cash,totalIncome,totalExpense,
    siblingReceived:sibling.careSupportPaidAmount,
    spouseReceived:receipt?.amount,spouseYear:receipt?.year,
    flowRemit:flow.expense.childRemittance,flowStudy:flow.expense.childEducation,
    flowDivorce:flow.expense.divorceChildSupport,
    flowSpouse:flow.expense.spouseSeparateSupport,
    flowSibling:flow.expense.siblingCareSupport+amounts.siblingCareSupportTravel
  };
`);
assert(actual.local>1,'food and housing scarcity increases locality expenses');
assert(actual.newPrice>actual.oldPrice,'annual inflation occurs before child receipt accounting');
assert.equal(actual.recipientYear,actual.year);
close(actual.received,actual.expectedReceipt,'independent child receives current-year scaled amount');
close(actual.childRemit,actual.received,'parent remittance debit equals the child budget credit');
close(actual.flowRemit,actual.received,'annual payer ledger reflects the child receipt');
assert(actual.childEducation>0 && actual.childLiving>0 && actual.childMedicalTravel>0);
assert(actual.childHousing>0 && actual.divorceSupport>0);
close(actual.flowStudy,actual.childEducation,'dependent student cost appears as cash expense');
close(actual.flowDivorce,actual.divorceSupport,'former-household child support is separately charged');
assert(actual.spouseSupport>0 && actual.siblingSupport>0);
close(actual.flowSpouse,actual.spouseReceived,'spouse receipt equals payer annual charge');
close(actual.flowSibling,actual.siblingReceived,'sibling receipt equals payer annual charge');
close(actual.totalIncome-actual.totalExpense,actual.flow.net,
  'all family living, medical, education and remittance entries reconcile to net flow');
close(actual.initialCash+actual.flow.net,actual.afterCash,
  'annual net flow accounts for actual cash movement without phantom income');
console.log('PASS independent child remittance inflation/locality and simultaneous child, spouse and sibling annual finances');
