'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const { context, setup } = require('./support/annual-cases.cjs');
const { ctx } = context(path.resolve(__dirname, '..'));
const inspect = code => JSON.parse(vm.runInContext('JSON.stringify((()=>{' + code + '})())', ctx));
const near = (actual,expected,note) =>
  assert(Math.abs(actual-expected)<0.001*Math.max(1,Math.abs(expected)),
    note+': actual '+actual+', expected '+expected);

setup(ctx,{id:'locality-adjusted-sibling-spouse-annual-support',seed:194400,region:'ヴィクトリア',age:40});
const r=inspect(`
  S.year=1100; S.age=40; S.priceIndex=1.2; S.cash=100000000;
  S.residenceArrangement='independent_rental'; S.fl.household_separated=1;
  ensureLocalityState(S);
  S.community.metrics.food=0.05; S.community.metrics.housing=0.05;
  const locality=localityLivingMultiplier(S), costPm=S.res.pm*S.priceIndex*locality;
  const base=P('economy.siblingInfectionSupportAnnualCost');
  S.siblings=[
    {id:'receives',nm:'療養中のきょうだい',by:1067,independentSinceYear:1090,
      region:S.res.n,knownRegion:S.res.n,inf:1,infKnown:1,careSupportAnnual:base,
      careSupportStartedYear:1098,financialCash:1000,financialDebt:25000,
      contactState:'regular',financialTransfers:[],aidReceivedTotal:0},
    {id:'not-subscribed',nm:'別のきょうだい',by:1070,independentSinceYear:1091,
      region:S.res.n,knownRegion:S.res.n,inf:1,infKnown:1,careSupportAnnual:0,
      contactState:'regular',financialCash:5000,financialDebt:0,financialTransfers:[]}
  ];S.legacySiblingCount=0;
  S.sp={id:'spouse-separate',nm:'別居配偶者',by:1073,inf:1,infHidden:0,tx:1,
    careEverStarted:1,d:0,sharesHousehold:false,residenceRegion:S.res.n,
    separateSupportPlan:'medical',separateContact:'letters',
    personalFinance:{status:'modeled_balance',startedYear:1090,cash:50000,debt:10000,
      expenseTier:2,condition:'strained',history:[],transfers:[],netChangeSinceStart:0}};
  const spouseEvent=EV.find(e=>e.id==='family_spouse_separate_life');
  const recipient=S.siblings[0],other=S.siblings[1];
  S.eventRelativeId=other.id;
  const secondQuote=siblingCareSupportQuote(S,other);
  const committed=independentSiblingCareSupportExpense(S);
  const reserve=annualCashReserve(S);
  const siblingChoice=EV.find(e=>e.id==='family_sibling_contact').c.find(c=>c.l.includes('毎年の薬代'));
  const rendered=tpl(siblingChoice.l,S);
  S.cash=committed+secondQuote+reserve-1;
  const tooPoor=ok(siblingChoice.en,S,tags(S));
  S.cash=committed+secondQuote+reserve;
  const enough=ok(siblingChoice.en,S,tags(S));
  const medicalPreview=spouseSeparateSupportCost(S,'medical'),
    medicalActual=spouseIndependentMedicalExpense(S),
    livingPreview=spouseSeparateSupportCost(S,'living');
  const spouseMedicalChoice=spouseEvent.c.find(c=>c.l.includes('相手が続けている治療'));
  const spouseLivingChoice=spouseEvent.c.find(c=>c.l.includes('生活費の足し'));
  const medicalGate=spouseMedicalChoice.en(S),
    livingGate=spouseLivingChoice.en(S);
  S.cash=100000000;
  S.eventRelativeId=recipient.id;
  const expense=prepareAnnualPersonalBudget(S,ANNUAL_SERVICES,S.age,S.t,S.f),
    due=expense.siblingCareSupportCost,
    spouseSupport=expense.spouseSeparateSupport,
    spouseContact=expense.spouseContactCost,
    before=recipient.financialCash,
    beforeDebt=recipient.financialDebt;
  const ledger=settleAnnualPersonalCash(S,ANNUAL_SERVICES,expense,S.age);
  recordAnnualFamilyPayments(S,ANNUAL_SERVICES,expense);
  const receipt=S.sp.personalFinance.supportReceipts?.at(-1),
    spouseRow=S.sp.personalFinance.history?.at(-1),
    siblingTransfer=recipient.financialTransfers?.at(-1);
  const paid={
    expenseSibling:ledger.annualFlow.expense.siblingCareSupport+
      expense.siblingCareSupportTravel,
    expenseSpouse:ledger.annualFlow.expense.spouseSeparateSupport,
    expenseContact:ledger.annualFlow.expense.spouseSeparateContact,
    recipientAmount:recipient.careSupportPaidAmount,
    recipientYear:recipient.careSupportPaidYear,
    recipientDebt:recipient.financialDebt,
    recipientCash:recipient.financialCash,
    before,beforeDebt,
    siblingTransfer:siblingTransfer?.amount,
    otherCash:other.financialCash,
    otherTransferCount:other.financialTransfers.length,
    spouseReceiptAmount:receipt?.amount,
    spouseReceiptId:receipt?.transactionId,
    spouseRowSupport:spouseRow?.support,
    spouseRowMedical:spouseRow?.medical,
    spouseRowTransactionId:spouseRow?.supportTransactionId,
    spouseReceiptCount:S.sp.personalFinance.supportReceipts.length,
    siblingTransferCount:recipient.financialTransfers.length
  };
  S.year=1101; S.age=41; S.priceIndex*=1+P('economy.costInflationAnnual');
  S.sp.separateSupportPlan='none';recipient.careSupportAnnual=0;
  const next=prepareAnnualPersonalBudget(S,ANNUAL_SERVICES,S.age,S.t,S.f);
  settleAnnualPersonalCash(S,ANNUAL_SERVICES,next,S.age);
  recordAnnualFamilyPayments(S,ANNUAL_SERVICES,next);
  const afterStop={
    siblingCost:next.siblingCareSupportCost,spouseSupport:next.spouseSeparateSupport,
    siblingTransferCount:recipient.financialTransfers.length,
    receiptCount:S.sp.personalFinance.supportReceipts.length,
    spouseRowSupport:S.sp.personalFinance.history.at(-1)?.support,
    lastSiblingPaidYear:recipient.careSupportPaidYear
  };
  return {locality,costPm,base,secondQuote,committed,reserve,tooPoor,enough,
    rendered,medicalPreview,medicalActual,livingPreview,medicalGate,livingGate,
    due,spouseSupport,spouseContact,paid,afterStop};
`);
assert(r.locality>1,'local food and housing shortages should increase the actual support cost');
near(r.secondQuote,r.committed,
  'both siblings have the same annual base, locality multiplier and treatment travel surcharge');
assert(r.secondQuote>r.base*r.costPm,
  'the rendered sibling quote includes the infection travel surcharge');
near(r.committed,r.due,'annual quoted commitments and actual personal expense agree');
assert.equal(r.tooPoor,false,'affordability must include local food and housing scarcity');
assert.equal(r.enough,true,'exact quoted annual obligations and reserve are affordable');
assert.match(r.rendered,/毎年の薬代/);
near(r.medicalPreview,r.medicalActual,'spouse medical support quote must exactly cover actual medical costs');
assert(r.livingPreview>0);
assert.equal(r.medicalGate,true);
assert.equal(r.livingGate,true);
near(r.spouseSupport,r.medicalActual,'paid spouse medical support equals spouse medical outgo');
near(r.paid.expenseSibling,r.due,'payer annual sibling expense equals beneficiary actual receipt');
near(r.paid.recipientAmount,r.due,'beneficiary annual payment equals payer cost');
near(r.paid.siblingTransfer,r.due,'transfer ledger equals charged sibling aid');
assert.equal(r.paid.recipientYear,1100);
assert.equal(r.paid.recipientDebt,0,'sibling debt is reduced first');
near(r.paid.recipientCash,r.paid.before + r.due - r.paid.beforeDebt,'sibling cash receives only the balance after debt repayment');
assert.equal(r.paid.otherCash,5000,'other sibling receives no support');
assert.equal(r.paid.otherTransferCount,0);
near(r.paid.expenseSpouse,r.medicalActual,'payer spouse expense equals annual receipt');
near(r.paid.spouseReceiptAmount,r.medicalActual,'spouse receipt equals payer debit');
near(r.paid.spouseRowSupport,r.medicalActual,'spouse finance history has exact support');
near(r.paid.spouseRowMedical,r.medicalActual,'spouse medical cost matches support');
assert.equal(r.paid.spouseRowTransactionId,r.paid.spouseReceiptId,'one payment ID joins payer and recipient history');
assert.equal(r.paid.spouseReceiptCount,1);
assert.equal(r.paid.siblingTransferCount,1);
assert.deepEqual(r.afterStop,{siblingCost:0,spouseSupport:0,
  siblingTransferCount:1,receiptCount:1,spouseRowSupport:0,lastSiblingPaidYear:1100},
  'ending both support plans does not create phantom payments next year');
console.log('PASS locality-specific sibling support, spouse medical receipts, annual balancing and stopped support');
