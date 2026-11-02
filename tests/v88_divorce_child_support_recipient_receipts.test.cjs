'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),vm=require('node:vm');
const {context,setup}=require('./support/annual-cases.cjs');
const {ctx}=context(path.resolve(__dirname,'..'));
const inspect=src=>JSON.parse(vm.runInContext('JSON.stringify((()=>{' + src + '})())',ctx));
const close=(a,b,msg)=>assert(Math.abs(a-b)<Math.max(0.001,Math.abs(b)*1e-10),msg+': '+a+' / '+b);

setup(ctx,{id:'divorce-two-children-two-recipients',seed:194621,region:'ヴィクトリア',age:40});
const result=inspect(`
  S.year=1100;S.age=40;S.priceIndex=1.21;S.job=5;S.cash=200000000;S.debt=0;
  S.residenceArrangement='independent_rental';S.fl.household_separated=1;
  S.relationshipHistory=[
    {id:'former-a',nm:'元配偶者A',ending:'離婚',endedYear:1092,residenceRegion:'龍門',knownResidenceRegion:'龍門'},
    {id:'former-b',nm:'元配偶者B',ending:'離婚',endedYear:1095,residenceRegion:'ウルサス',knownResidenceRegion:'ウルサス'}
  ];
  S.kids=[
    {id:'child-a',nm:'元配偶者A側の子',by:1090,otherParentId:'former-a',householdResidencePlan:'former_support'},
    {id:'child-b',nm:'元配偶者B側の子',by:1091,otherParentId:'former-b',householdResidencePlan:'former_support'},
    {id:'child-not-paid',nm:'こちらの家の子',by:1093,otherParentId:'former-a',householdResidencePlan:'self'}
  ];
  const y0=()=>{
    const amounts=prepareAnnualPersonalBudget(S,ANNUAL_SERVICES,S.age,S.t,S.f);
    settleAnnualPersonalCash(S,ANNUAL_SERVICES,amounts,S.age);
    recordAnnualFamilyPayments(S,ANNUAL_SERVICES,amounts);
    const child=S.kids,former=S.relationshipHistory;
    return {payer:S.flow.expense.divorceChildSupport,
      charged:amounts.divorceChildSupportCost,
      amounts:child.map(c=>({id:c.id,paid:c.divorceSupportPaidAmount||0,
        total:c.divorceSupportPaidTotal||0,
        rows:(c.divorceSupportReceipts||[]).map(r=>({year:r.year,amount:r.amount,transactionId:r.transactionId,recipientId:r.recipientId}))})),
      recipients:former.map(f=>({id:f.id,rows:(f.childSupportReceipts||[]).map(r=>({year:r.year,amount:r.amount,transactionId:r.transactionId,childId:r.childId}))}))
    };
  };
  const first=y0(),firstA=S.kids[0].divorceSupportReceipts[0],
    firstB=S.kids[1].divorceSupportReceipts[0],
    beforeExtra=S.kids.map(c=>c.divorceSupportPaidTotal||0);
  recordDivorceChildSupportPayments(S);
  const noDuplicate=S.kids.every((c,i)=>(c.divorceSupportPaidTotal||0)===beforeExtra[i])&&
    S.relationshipHistory.every(f=>f.childSupportReceipts.length===1);
  S.year=1101;S.age=41;S.priceIndex*=1+P('economy.costInflationAnnual');
  S.kids[1].householdResidencePlan='former';
  const second=y0();
  S.year=1108;S.age=48;S.priceIndex*=1+P('economy.costInflationAnnual');
  const third=y0();
  return {first,second,third,firstA,firstB,noDuplicate,
    formerA:S.relationshipHistory[0].childSupportReceipts.length,
    formerB:S.relationshipHistory[1].childSupportReceipts.length};
`);
const a=result.first;
assert(a.payer>0 && a.charged>0);
close(a.payer,a.charged,'payer expense equals the total child support invoice');
close(a.amounts[0].paid+a.amounts[1].paid,a.payer,'both children have matching receipts');
assert.equal(a.amounts[2].rows.length,0,'self-resident child receives no former household support');
assert.notEqual(a.amounts[0].paid,a.amounts[1].paid,'residence region indexes determine distinct child amounts');
for(const i of [0,1]){
  const child=a.amounts[i],former=a.recipients[i],c=child.rows[0],f=former.rows[0];
  assert.equal(child.rows.length,1);
  assert.equal(former.rows.length,1);
  assert.equal(c.recipientId,former.id);
  assert.equal(c.transactionId,f.transactionId);
  assert.equal(c.amount,f.amount);
  assert.equal(f.childId,child.id);
}
assert.equal(result.noDuplicate,true,'recording the same year twice does not credit anyone twice');
assert(result.second.payer>0 && result.second.payer<a.payer,
  'stopping one child support plan leaves only the other child funded');
assert.equal(result.second.amounts[0].rows.length,2);
assert.equal(result.second.amounts[1].rows.length,1);
close(result.second.payer,result.second.amounts[0].paid,'second-year invoice follows only the active child');
assert.equal(result.third.payer,0,'support ends on adulthood');
assert.equal(result.third.amounts[0].rows.length,2);
assert.equal(result.third.amounts[1].rows.length,1);
assert.equal(result.formerA,2);
assert.equal(result.formerB,1);
console.log('PASS two divorced co-parents, two children, exact payer/recipient receipts, duplicate guard and adulthood end');
