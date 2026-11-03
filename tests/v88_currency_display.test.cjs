'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),vm=require('node:vm');
const {context,setup}=require('./support/annual-cases.cjs');
const {ctx}=context(path.resolve(__dirname,'..'));
setup(ctx,{id:'currency',seed:946821,region:'カジミエーシュ',age:18});
const r=JSON.parse(vm.runInContext(`JSON.stringify((()=>{
 const fmt=ANNUAL_SERVICES.m(150000);
 const loans=['loan_shark_lungmen','loan_shark_siracusa','loan_shark_columbia'].map(id=>{
  const e=EV.find(x=>x.id===id);
  return {id,currency:e.c[0].o[0][2].loanContract.currency};
 });
 S.householdExitAge=18;S.residenceArrangement='family_home_shared_budget';
 S.fl.household_separated=0;S.house.cash=12000000;S.house.debt=0;S.w=WEALTH[4];
 S.familyLaunchTransferred=false;S.moneyLog=[];
 const notices=[],services={...ANNUAL_SERVICES,L:text=>notices.push(String(text))};
 const before=S.cash;
 settleAnnualHouseholdBudget(S,services,18);
 const grant=S.moneyLog.find(x=>x.label==='実家からの自立支度金')?.assetsDelta||0;
 const life=ensureLifeRecord(S);
 life.organizations.push({id:'currency-test',title:'互助団体',status:'active',
  startedYear:S.year,contributionsTotal:150000,spentTotal:30000,
  operatingReserve:120000,policy:'医療互助',participation:'参加'});
 S.loanContracts=[{id:'contract-test',account:'personal',creditor:'シラクーザの会計役',
  currency:'龍門幣換算',principal:700000,totalDue:1050000,balance:1050000,
  history:[],status:'open',dueYear:1099,terms:'追加利息なし。'}];
 return {fmt,loans,grant,credited:S.cash-before,
  notice:notices.find(x=>x.includes('門出の支度金'))||'',summary:lifeSummaryMarkup(S)};
})())`,ctx));
assert.equal(r.fmt,'150,000龍門幣');
assert.deepEqual(r.loans,[
 {id:'loan_shark_lungmen',currency:'龍門幣'},
 {id:'loan_shark_siracusa',currency:'龍門幣換算'},
 {id:'loan_shark_columbia',currency:'龍門幣換算'}]);
assert.ok(r.grant>0);
assert.equal(r.credited,r.grant);
assert.ok(r.notice.includes(r.grant.toLocaleString('ja-JP')+'龍門幣'));
assert.doesNotMatch(r.notice,/テラ通貨/);
assert.match(r.summary,/会費累計150,000龍門幣・運営費30,000龍門幣・残額120,000龍門幣/);
assert.match(r.summary,/金額単位：龍門幣換算/);
assert.match(r.summary,/元本700,000、総額1,050,000、返済0、残額1,050,000/);
assert.doesNotMatch(r.summary,/龍門幣龍門幣|現地通貨（モデル単位）/);
console.log('PASS currency display, family launch grant and debt unit');
