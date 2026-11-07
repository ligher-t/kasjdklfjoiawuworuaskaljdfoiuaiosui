'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const { context, setup } = require('./support/annual-cases.cjs');
const { ctx } = context(path.resolve(__dirname, '..'));
const inspect = source => JSON.parse(vm.runInContext('JSON.stringify((()=>{' + source + '})())', ctx));

for (const shared of [false, true]) {
  setup(ctx,{id:'spouse-once-'+shared,seed:194511+(shared?1:0),region:'ヴィクトリア',age:40});
  ctx.SHARED=shared;
  const r=inspect(`
    S.year=1100;S.age=40;S.priceIndex=1.15;
    S.residenceArrangement=SHARED?'family_home_shared_budget':'independent_rental';
    S.fl.household_separated=SHARED?0:1;
    S.sp={
      id:'spouse-finance-aid',nm:'家計を相談する配偶者',r:S.r,by:1071,d:0,
      sharesHousehold:SHARED,residenceRegion:S.res.n,
      personalFinance:{status:'modeled_balance',startedYear:1090,
        cash:50000,debt:25000,expenseTier:2,condition:'strained',
        history:[],transfers:[],netChangeSinceStart:0}
    };
    S.house={cash:0,debt:0,inc:0,exp:0};
    const e=EV.find(e=>e.id==='family_spouse_finance_strain'),
      option=e.c[0],cost=spouseFinanceAidCost(S),reserve=annualCashReserve(S),
      useHouse=inSharedHousehold(S),wallet=useHouse?S.house:S;
    wallet.cash=cost+reserve-1;
    const short=ok(option.en,S,tags(S));
    wallet.cash=cost+reserve;
    const enough=ok(option.en,S,tags(S)),before=wallet.cash,
      otherWalletBefore=useHouse?S.cash:S.house.cash;
    ap(option.o[0][2]);
    const finance=S.sp.personalFinance,transfer=finance.transfers.at(-1);
    return {shared:SHARED,useHouse,short,enough,cost,reserve,
      spent:before-wallet.cash,otherWalletUnchanged:otherWalletBefore===(useHouse?S.cash:S.house.cash),
      debt:finance.debt,cash:finance.cash,recorded:transfer?.amount,
      appliedToDebt:transfer?.debtPaid,creditedCash:transfer?.cashAdded,
      reviewYear:finance.reviewYear,historyLength:finance.transfers.length};
  `);
  assert(r.cost>0 && r.reserve>0);
  assert.equal(r.useHouse,shared,'wallet route must match household sharing status');
  assert.equal(r.short,false,'the one-time spouse transfer must preserve a living reserve');
  assert.equal(r.enough,true);
  assert.equal(r.spent,r.cost,'payer is debited exactly the transfer amount');
  assert.equal(r.recorded,r.cost,'spouse ledger records the identical amount');
  assert.equal(r.appliedToDebt,25000,'spouse existing debt is paid first');
  assert.equal(r.debt,0);
  assert.equal(r.creditedCash,r.cost-25000);
  assert.equal(r.cash,50000+r.cost-25000);
  assert.equal(r.otherWalletUnchanged,true,'only the correct payer wallet is charged');
  assert.equal(r.historyLength,1);
  assert(r.reviewYear>=1100,'spouse finance review is rescheduled for the recipient');
}

setup(ctx,{id:'annual-support-duplicate-guard',seed:194513,region:'クルビア',age:40});
const r=inspect(`
  S.year=1100;S.age=40;S.priceIndex=1.13;
  S.residenceArrangement='independent_rental';S.fl.household_separated=1;
  S.siblings=[
    {id:'subscribed',nm:'療養を受けるきょうだい',by:1070,inf:1,infKnown:1,
      independentSinceYear:1090,careSupportAnnual:P('economy.siblingInfectionSupportAnnualCost'),
      financialCash:1000,financialDebt:2000,financialTransfers:[],aidReceivedTotal:0},
    {id:'no-plan',nm:'支援を受けないきょうだい',by:1071,inf:1,infKnown:1,
      independentSinceYear:1091,careSupportAnnual:0,financialCash:8000,financialTransfers:[]}
  ];S.legacySiblingCount=0;
  S.sp={id:'separate-spouse',nm:'別居配偶者',by:1070,d:0,inf:1,infHidden:0,tx:1,
    sharesHousehold:false,residenceRegion:S.res.n,separateSupportPlan:'medical',
    personalFinance:{status:'modeled_balance',startedYear:1090,cash:0,debt:0,
      expenseTier:2,condition:'strained',history:[],transfers:[],netChangeSinceStart:0}};
  const sibling=S.siblings[0],other=S.siblings[1],
    expectedSibling=independentSiblingCareSupportExpense(S),
    expectedSpouse=spouseSeparateSupportCost(S),
    idFirst=recordSpouseSeparateSupportTransfer(S,expectedSpouse);
  recordIndependentSiblingCareSupportPayments(S);
  const afterFirst={
    sibPaid:sibling.careSupportPaidTotal,sibReceived:sibling.aidReceivedTotal,
    sibReceipts:sibling.financialTransfers.length,sibCash:sibling.financialCash,
    sibDebt:sibling.financialDebt,otherCash:other.financialCash,
    spousePaid:S.sp.separateSupportPaidTotal,spouseReceipts:S.sp.personalFinance.supportReceipts.length,
    spouseHistory:S.sp.separateSupportHistory.length
  };
  const idRepeat=recordSpouseSeparateSupportTransfer(S,expectedSpouse);
  recordIndependentSiblingCareSupportPayments(S);
  const afterRepeat={
    sibPaid:sibling.careSupportPaidTotal,sibReceived:sibling.aidReceivedTotal,
    sibReceipts:sibling.financialTransfers.length,sibCash:sibling.financialCash,
    sibDebt:sibling.financialDebt,otherCash:other.financialCash,
    spousePaid:S.sp.separateSupportPaidTotal,spouseReceipts:S.sp.personalFinance.supportReceipts.length,
    spouseHistory:S.sp.separateSupportHistory.length
  };
  S.year=1101;S.age=41;S.priceIndex*=1+P('economy.costInflationAnnual');
  const nextSibling=independentSiblingCareSupportExpense(S),
    nextSpouse=spouseSeparateSupportCost(S),
    idNext=recordSpouseSeparateSupportTransfer(S,nextSpouse);
  recordIndependentSiblingCareSupportPayments(S);
  const afterNext={
    sibPaid:sibling.careSupportPaidTotal,sibReceipts:sibling.financialTransfers.length,
    spousePaid:S.sp.separateSupportPaidTotal,spouseReceipts:S.sp.personalFinance.supportReceipts.length
  };
  S.year=1102;S.age=42;S.sp.separateSupportPlan='none';sibling.careSupportAnnual=0;
  const stoppedSibling=independentSiblingCareSupportExpense(S),
    stoppedSpouse=spouseSeparateSupportCost(S);
  recordIndependentSiblingCareSupportPayments(S);
  if(stoppedSpouse)recordSpouseSeparateSupportTransfer(S,stoppedSpouse);
  const afterStop={sibPaid:sibling.careSupportPaidTotal,
    sibReceipts:sibling.financialTransfers.length,
    spousePaid:S.sp.separateSupportPaidTotal,
    spouseReceipts:S.sp.personalFinance.supportReceipts.length};
  return {expectedSibling,expectedSpouse,idFirst,idRepeat,idNext,
    afterFirst,afterRepeat,afterNext,stoppedSibling,stoppedSpouse,afterStop,
    receiptIds:S.sp.personalFinance.supportReceipts.map(x=>x.transactionId),
    siblingReceiptYears:sibling.financialTransfers.map(x=>x.year)};
`);
assert(r.expectedSibling>0 && r.expectedSpouse>0);
assert.equal(r.afterFirst.sibPaid,r.expectedSibling);
assert.equal(r.afterFirst.sibReceived,r.expectedSibling);
assert.equal(r.afterFirst.sibReceipts,1);
assert.equal(r.afterFirst.sibDebt,0);
assert.equal(r.afterFirst.sibCash,1000+r.expectedSibling-2000);
assert.equal(r.afterFirst.otherCash,8000);
assert.equal(r.afterFirst.spousePaid,r.expectedSpouse);
assert.equal(r.afterFirst.spouseReceipts,1);
assert.equal(r.afterFirst.spouseHistory,1);
assert.deepEqual(r.afterRepeat,r.afterFirst,'repeat annual recording does not duplicate sibling or spouse receipts');
assert.equal(r.idRepeat,null,'second receipt posting in same year is ignored');
assert(r.idFirst?.includes('1100'));
assert(r.idNext?.includes('1101'));
assert.equal(r.afterNext.sibReceipts,2);
assert.equal(r.afterNext.spouseReceipts,2);
assert(r.afterNext.sibPaid>r.afterFirst.sibPaid);
assert(r.afterNext.spousePaid>r.afterFirst.spousePaid);
assert.deepEqual(r.receiptIds,[r.idFirst,r.idNext]);
assert.deepEqual(r.siblingReceiptYears,[1100,1101]);
assert.equal(r.stoppedSibling,0);
assert.equal(r.stoppedSpouse,0);
assert.deepEqual(r.afterStop,r.afterNext,'ending support prevents new payments but preserves old receipts');
console.log('PASS spouse debt relief reserve, correct wallet, one annual receipt per recipient and plan closure');
