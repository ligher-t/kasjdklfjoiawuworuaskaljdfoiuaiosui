'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),vm=require('node:vm');
const {context,setup}=require('./support/annual-cases.cjs');
const {ctx}=context(path.resolve(__dirname,'..'));
let n=0;
function fresh(region="クルビア",age=22){
  setup(ctx,{id:"p07-case-"+(++n),seed:774199+n,region,age});
}
function run(fn){
  return JSON.parse(vm.runInContext('JSON.stringify(('+fn.toString()+')())',ctx,{timeout:12000}));
}
fresh();
const purity=run(function(){
  const s=S;s.age=22;s.cash=90000;s.house.cash=40000;s.debt=3000;
  const prior={cash:s.cash,house:s.house.cash,debt:s.debt,
    randomState:s.rngState,schoolCount:Object.keys(s.world?.educationWorld?.institutions||{}).length};
  const first=educationQuoteCosts(s,{caseId:"q1",stage:"university",kind:"entrance-exam",tier:1}),
    next=educationQuoteCosts(s,{caseId:"q1",stage:"university",kind:"entrance-exam",tier:1});
  const after={cash:s.cash,house:s.house.cash,debt:s.debt,
    randomState:s.rngState,schoolCount:Object.keys(s.world?.educationWorld?.institutions||{}).length};
  const invalid=()=>{try{educationEnsureInvoice(s,{
    id:"illegal",kind:"tuition",amount:-100,institutionId:"school:A"
  });return false;}catch{return true;}};
  const rejected=invalid();
  return {equal:JSON.stringify(first)===JSON.stringify(next),
    unchanged:JSON.stringify(prior)===JSON.stringify(after),
    exam:first.amount,rate:Math.round(educationFunds(s,"university",1)*0.06),
    rejected,notInvoiced:!s.educationFinance.invoices.illegal};
});
assert.equal(purity.equal,true);
assert.equal(purity.unchanged,true);
assert.equal(purity.exam,purity.rate);
assert.equal(purity.rejected,true);
assert.equal(purity.notInvoiced,true);
fresh("龍門",12);
const mixed=run(function(){
  const s=S;s.age=12;s.cash=5000;s.house.cash=20000;
  const entry={id:"e:mix:tuition:1090",kind:"tuition",amount:24000,
    institutionId:"school:test",serviceYear:s.year,discount:0};
  const inv=educationEnsureInvoice(s,entry),again=educationEnsureInvoice(s,entry);
  const before={personal:s.cash,house:s.house.cash};
  const plan=educationPlanSettlement(s,inv.id),paid=educationCommitSettlement(s,plan);
  const retry=educationCommitSettlement(s,plan);
  const cashEntries=inv.receiptIds.map(id=>s.educationFinance.receipts[id]);
  return {same:inv===again,allowed:plan.allowed,paid:paid.amount,
    retry:retry.id===paid.id,personal:before.personal-s.cash,house:before.house-s.house.cash,
    receipts:cashEntries.map(x=>({source:x.source,amount:x.amount})),
    outflow:[educationAnnualOutflow(s,s.year,"personal"),educationAnnualOutflow(s,s.year,"household")],
    unpaid:inv.outstanding,status:inv.status,audit:educationCheckFinanceInvariants(s)};
});
assert.equal(mixed.same,true);
assert.equal(mixed.allowed,true);
assert.equal(mixed.paid,24000);
assert.equal(mixed.retry,true);
assert.equal(mixed.personal,4000);
assert.equal(mixed.house,20000);
assert.equal(mixed.receipts.length,2);
assert.deepEqual(mixed.outflow,[4000,20000]);
assert.equal(mixed.unpaid,0);
assert.equal(mixed.status,"paid");
assert.deepEqual(mixed.audit,[]);
fresh("クルビア",22);
const support=run(function(){
  const s=S;s.age=22;s.cash=70000;s.house.cash=0;
  const invoice=educationEnsureInvoice(s,{id:"student:discount:1090",kind:"tuition",
    institutionId:"college:grant",amount:100000,discount:10000,serviceYear:s.year});
  const plan=educationPlanSettlement(s,invoice.id,{
    grant:{id:"grant:award-9:"+invoice.id,amount:20000,basis:"game-model-approval"}
  });
  const first=educationCommitSettlement(s,plan);
  return {allowed:plan.allowed,paid:first.amount,gross:invoice.gross,
    discount:invoice.discountTotal,net:invoice.net,outstanding:invoice.outstanding,
    actualOutflow:educationAnnualOutflow(s,s.year,"personal"),balance:s.cash,
    grants:Object.keys(s.educationFinance.grants).length,
    receiptSources:invoice.receiptIds.map(id=>s.educationFinance.receipts[id].source),
    audit:educationCheckFinanceInvariants(s)};
});
assert.equal(support.allowed,true);
assert.equal(support.gross,100000);
assert.equal(support.discount,10000);
assert.equal(support.net,90000);
assert.equal(support.paid,90000);
assert.equal(support.outstanding,0);
assert.equal(support.actualOutflow,70000);
assert.equal(support.balance,0);
assert.equal(support.grants,1);
assert.deepEqual(support.receiptSources,["personal","grant"]);
assert.deepEqual(support.audit,[]);
fresh("クルビア",22);
const loan=run(function(){
  const s=S;s.age=22;s.cash=20000;s.house.cash=0;s.debt=0;s.loanContracts=[];
  const invoice=educationEnsureInvoice(s,{id:"enrol:loan:tuition:"+s.year,
    kind:"tuition",institutionId:"college:A",amount:30000});
  const loanId="edu-loan:enrol:loan:"+invoice.id;
  const plan=educationPlanSettlement(s,invoice.id,{
    loan:{id:loanId,amount:10000,creditor:"クルビアの学資貸付人"}
  });
  const posted=educationCommitSettlement(s,plan);
  const contract=s.loanContracts[0],debtBefore=s.debt;
  const refundPlan=educationPlanRefund(s,invoice.id,"tuition-school-cancel-before-term");
  const refund=educationCommitRefund(s,refundPlan);
  const retry=educationCommitRefund(s,refundPlan);
  return {allowed:plan.allowed,posted:posted.amount,principal:contract.principal,
    totalDue:contract.totalDue,debtBefore,paidBack:debtBefore-s.debt,
    loanBalance:contract.balance,cash:s.cash,refunded:refund?.amount,
    retry:retry?.id===refund?.id,
    loanSource:invoice.receiptIds.map(id=>s.educationFinance.receipts[id].source),
    outflow:educationAnnualOutflow(s,s.year,"personal"),
    audit:educationCheckFinanceInvariants(s)};
});
assert.equal(loan.allowed,true);
assert.equal(loan.posted,30000);
assert.equal(loan.principal,10000);
assert.equal(loan.totalDue,11000);
assert.equal(loan.debtBefore,11000);
assert.equal(loan.paidBack,10000);
assert.equal(loan.loanBalance,1000);
assert.equal(loan.cash,20000);
assert.equal(loan.refunded,30000);
assert.equal(loan.retry,true);
assert.deepEqual(loan.loanSource,["personal","contract-loan"]);
assert.equal(loan.outflow,0);
assert.deepEqual(loan.audit,[]);
fresh("龍門",12);
const refund=run(function(){
  const s=S;s.age=12;s.cash=80000;s.house.cash=120000;
  const inv=educationEnsureInvoice(s,{
    id:"enrol:partial:tuition:"+s.year,kind:"tuition",
    institutionId:"school:partial",amount:200000});
  const posting=educationSettleInvoice(s,inv);
  const denied=educationPlanRefund(s,inv.id,"tuition-school-cancel-midyear",{
    contractedTeachingPeriods:12,verifiedTeachingPeriods:4,makeupProvided:true
  });
  const plan=educationPlanRefund(s,inv.id,"tuition-school-cancel-midyear",{
    contractedTeachingPeriods:12,verifiedTeachingPeriods:4,makeupProvided:false
  });
  const payment=educationCommitRefund(s,plan),again=educationCommitRefund(s,plan);
  const last=payment.allocation;
  return {posted:posting.amount,denied:denied.allowed,amount:payment.amount,
    again:payment.id===again.id,personal:s.cash,house:s.house.cash,
    shares:last.map(x=>({source:x.source,amount:x.amount})),
    remaining:inv.paid-inv.refunded,audit:educationCheckFinanceInvariants(s)};
});
assert.equal(refund.posted,200000);
assert.equal(refund.denied,false);
assert.equal(refund.amount,133333);
assert.equal(refund.again,true);
assert.equal(refund.personal,53333);
assert.equal(refund.house,80000);
assert.deepEqual(refund.shares,[{source:"personal",amount:53333},{source:"household",amount:80000}]);
assert.equal(refund.remaining,66667);
assert.deepEqual(refund.audit,[]);
fresh("クルビア",22);
const unpaid=run(function(){
  const s=S;s.age=22;s.cash=19999;s.house.cash=500000;
  s.fl.household_separated=1;s.residenceArrangement="independent";
  const invoice=educationEnsureInvoice(s,{id:"noFunds",kind:"tuition",
    institutionId:"college:separate",amount:20000});
  const before={cash:s.cash,house:s.house.cash,debt:s.debt};
  const plan=educationPlanSettlement(s,invoice.id);
  return {allowed:plan.allowed,reason:plan.reason,
    untouched:before.cash===s.cash&&before.house===s.house.cash&&before.debt===s.debt,
    outstanding:invoice.outstanding,debt:s.debt,paid:invoice.paid};
});
assert.equal(unpaid.allowed,false);
assert.equal(unpaid.reason,"insufficient-funds");
assert.equal(unpaid.untouched,true);
assert.equal(unpaid.outstanding,20000);
assert.equal(unpaid.paid,0);
fresh("ヴィクトリア",22);
const different=run(function(){
  const s=S;s.age=22;s.cash=200000;s.house.cash=0;
  const first=educationEnsureInvoice(s,{id:"case:a:exam:1",kind:"entrance-exam",
    institutionId:"school:A",amount:12000});
  const second=educationEnsureInvoice(s,{id:"case:b:exam:1",kind:"entrance-exam",
    institutionId:"school:B",amount:18000});
  educationSettleInvoice(s,first);educationSettleInvoice(s,second);
  const paid=educationAnnualOutflow(s,s.year,"personal");
  const clone=JSON.parse(JSON.stringify(s.educationFinance));
  const again=educationSettleInvoice(s,first);
  const after=JSON.stringify(s.educationFinance);
  const zero=educationEnsureInvoice(s,{id:"school:free:tuition",kind:"tuition",
    institutionId:"school:free",amount:0});
  return {paid,preserved:JSON.stringify(clone)===after,again:again.id,
    invoiceCount:Object.keys(s.educationFinance.invoices).length,
    examPaid:first.paid+second.paid,
    zeroStatus:zero.status,zeroReceipts:zero.receiptIds.length};
});
assert.equal(different.paid,30000);
assert.equal(different.preserved,true);
assert.equal(different.examPaid,30000);
assert.equal(different.invoiceCount,3);
assert.equal(different.zeroStatus,"paid");
assert.equal(different.zeroReceipts,0);
fresh("クルビア",22);
const caseLoan=run(function(){
  const s=S;s.age=22;s.mo=3;s.cash=10000;s.house.cash=0;s.debt=0;s.job=0;
  s.study=null;s.fl.sch=0;s.loanContracts=[];
  s.res=REG.find(x=>x.n==="クルビア");
  ensureResidenceIdentity(s);ensureEducationWorldForResidence(s);
  const world=s.world.educationWorld,areaId=s.local.educationAreaId;
  const institution=educationRegisterInstitution(world,areaId,
    "tuition-credit-fixture","university",["university"],s.year);
  const offering=world.offerings[institution.offeringIds[0]];
  offering.admissionTier=1;
  const item=educationCaseBegin(s,"higher-path","university",1);
  item.phase="contract";item.stepsUsed=2;
  item.applicationId=item.id+":application:1";
  item.offeringId=offering.id;item.campusId=offering.campusId;
  item.targetInstitutionId=institution.id;
  const access=educationAccessState(s);
  access.knownOfferings[offering.id]={
    offeringId:offering.id,institutionId:institution.id,
    campusId:offering.campusId,
    stage:"university",tier:1,epistemicStatus:"offering-verified",
    checkedAt:{year:s.year,month:s.mo},informationSource:"in-person-inquiry",
    admissionStatus:"open",teachingStatus:"teaching"
  };
  access.notices[item.applicationId]={
    applicationId:item.applicationId,offeringId:offering.id,result:"accepted",
    informedAt:{year:s.year,month:s.mo}
  };
  const before={cash:s.cash,house:s.house.cash,debt:s.debt,enroll:s.educationRecord.enrollments.length};
  const noCash=educationCaseCommitEligibility(s);
  const consulted=educationCaseFinanceInquiry(s);
  const verified=educationCaseCommitEligibility(s,"loan");
  const originalTransition=recordEducationTransition;
  recordEducationTransition=()=>{throw Error("test enrollment failure");};
  let rejected;
  try{rejected=educationCaseCommit(s,"loan");}
  finally{recordEducationTransition=originalTransition;}
  const rollbackClean=rejected===false && s.cash===before.cash &&
    s.debt===before.debt && s.educationRecord.enrollments.length===before.enroll &&
    s.loanContracts.length===0 && !Object.values(s.educationFinance?.invoices||{})
      .some(x=>x.kind==="tuition"&&x.caseId===item.id);
  const success=educationCaseCommit(s,"loan");
  const history=s.educationCases.history.at(-1);
  const inv=s.educationFinance?.invoices?.["enrol-"+(before.enroll+1)+":tuition:"+s.year];
  return {noCash:noCash.reason,consulted,verified:verified.allowed,
    rollbackClean,success,
    reason:history?.reason,oldCash:before.cash,newCash:s.cash,
    debtBefore:before.debt,debtAfter:s.debt,
    loanCount:s.loanContracts.length,loanPrincipal:s.loanContracts[0]?.principal,
    enrolled:s.educationPath?.status,offeringSame:s.educationPath?.offeringId===offering.id,
    tuitionInvoice:inv?.id,paid:inv?.paid,net:inv?.net,
    cashReceipts:inv?.receiptIds?.map(id=>s.educationFinance.receipts[id].source),
    duplicate:educationCaseCommit(s,"loan"),
    audit:educationCheckFinanceInvariants(s)};
});
assert.equal(caseLoan.noCash,"no-funds");
assert.equal(caseLoan.consulted,true);
assert.equal(caseLoan.verified,true);
assert.equal(caseLoan.rollbackClean,true,"rejected enrollment cannot leave tuition or debt behind");
assert.equal(caseLoan.success,true);
assert.equal(caseLoan.reason,"admitted");
assert.equal(caseLoan.newCash,0);
assert.equal(caseLoan.loanCount,1);
assert.equal(caseLoan.enrolled,"enrolled");
assert.equal(caseLoan.offeringSame,true);
assert.equal(caseLoan.paid,caseLoan.net);
assert.deepEqual(caseLoan.cashReceipts,["personal","contract-loan"]);
assert.equal(caseLoan.duplicate,false);
assert.deepEqual(caseLoan.audit,[]);
fresh("龍門",12);
const ownerAndSequence=run(function(){
  const s=S;s.age=12;s.cash=80000;s.house.cash=120000;
  const inv=educationEnsureInvoice(s,{id:"multi-refund",kind:"tuition",
    institutionId:"school:multi",amount:200000});
  educationSettleInvoice(s,inv);
  const first=educationCommitRefund(s,educationPlanRefund(s,inv.id,
    "tuition-school-cancel-midyear",{
      contractedTeachingPeriods:12,verifiedTeachingPeriods:4,makeupProvided:false
    }));
  const second=educationCommitRefund(s,educationPlanRefund(s,inv.id,
    "tuition-school-cancel-before-term"));
  const amount=first.amount+second.amount,
    ledgerIssues=educationCheckFinanceInvariants(s);
  const third=educationPlanRefund(s,inv.id,"tuition-student-withdraw-before-term");
  const oldHouse=s.house;
  s.house={...oldHouse,educationWalletId:"another-household",cash:0};
  const next=educationEnsureInvoice(s,{id:"another-refund",kind:"tuition",
    institutionId:"school:test2",amount:1200});
  // Constructing an explicit former household claim exercises the
  // destination guard without changing any real account.
  next.paid=1200;next.net=1200;next.gross=1200;next.outstanding=0;next.status="paid";
  const id="old-pay";s.educationFinance.receipts[id]={id,invoiceId:next.id,
    source:"household",sourceRef:oldHouse.educationWalletId,
    amount:1200,status:"settled",paidAt:{year:s.year,month:s.mo||0}};
  next.receiptIds=[id];
  const plan=educationPlanRefund(s,next.id,"tuition-school-cancel-before-term"),
    denied=educationCommitRefund(s,plan);
  return {amount,personal:oldHouse? s.cash:null,originalHouse:oldHouse.cash,
    zeroThird:third.allowed,issues:ledgerIssues,
    refusedMisroute:denied===null,newHouseCash:s.house.cash};
});
assert.equal(ownerAndSequence.amount,200000);
assert.equal(ownerAndSequence.personal,80000);
assert.equal(ownerAndSequence.originalHouse,120000);
assert.equal(ownerAndSequence.zeroThird,false);
assert.deepEqual(ownerAndSequence.issues,[]);
assert.equal(ownerAndSequence.refusedMisroute,true);
assert.equal(ownerAndSequence.newHouseCash,0);
function legacyExamOutcome(roll,budget){
  fresh("クルビア",22);
  ctx.p07ExamFixture={roll,budget};
  return run(function(){
    const s=S;s.age=22;s.cash=1000000;s.house.cash=0;
    s.educationPath={version:1,status:"completed",stage:"upper",tier:1,
      completed:["upper"],equivalency:[],history:[],yearsCompleted:3,duration:3,
      startedYear:s.year-4,stageStartYear:s.year-4,lastProcessedYear:s.year};
    s.study=null;s.fl.sch=0;
    const exam=educationExam(s,"university",1);
    s.cash=p07ExamFixture.budget===null?1000000:exam.examFee+1;
    const initial=s.cash;
    DEBUG_RANDOM=()=>p07ExamFixture.roll;
    try{educationApplyAction(s,"apply:university:1");}
    finally{DEBUG_RANDOM=null;}
    const invoices=Object.values(s.educationFinance?.invoices||{}),
      applied=invoices.filter(x=>x.kind==="entrance-exam"),
      tuition=invoices.filter(x=>x.kind==="tuition");
    return {eligible:exam.allowed,fee:exam.examFee,examInvoice:applied[0]?.net,
      examPaid:applied[0]?.paid,examCount:applied.length,
      tuitionPaid:tuition.reduce((n,x)=>n+x.paid,0),
      cashSpent:initial-s.cash,enrolled:s.educationPath?.status==="enrolled",
      ledgerIssues:educationCheckFinanceInvariants(s)};
  });
}
const examFail=legacyExamOutcome(0.999,null),
  examPass=legacyExamOutcome(0,null),
  examOnly=legacyExamOutcome(0,"only-exam");
assert.equal(examFail.eligible,true);
assert.equal(examPass.eligible,true);
assert.equal(examFail.examCount,1);
assert.equal(examPass.examCount,1);
assert.equal(examFail.examPaid,examPass.examPaid);
assert.equal(examFail.examPaid,examFail.fee);
assert.equal(examFail.tuitionPaid,0);
assert(examPass.tuitionPaid>0);
assert.equal(examOnly.eligible,true);
assert.equal(examOnly.examPaid,examOnly.fee);
assert.equal(examOnly.tuitionPaid,0);
assert.equal(examOnly.enrolled,false);
assert.deepEqual(examFail.ledgerIssues,[]);
assert.deepEqual(examPass.ledgerIssues,[]);
assert.deepEqual(examOnly.ledgerIssues,[]);
fresh("龍門",12);
const mobility=run(function(){
  const s=S;s.age=12;s.cash=100;s.house.cash=100000;s.mo=4;
  ensureResidenceIdentity(s);ensureEducationWorldForResidence(s);
  const world=s.world.educationWorld,origin=s.local.educationAreaId;
  const target=Object.values(world.areas).find(x=>x.id!==origin)?.id;
  if(!target)throw Error("No second area to exercise student residence");
  educationCreateMobilityState(s);
  const id="edu-residence:protagonist:test";
  s.educationMobility.residenceContracts[id]={
    id,personId:"protagonist",status:"committed",actualAreaId:target,
    previousHomeRef:origin,householdRemainsAtOrigin:true,
    lodgingKind:"institution-dormitory",providerId:"dorm:test",
    start:{year:s.year,month:4},end:{year:s.year,month:9},
    feeSchedule:{"boarding-room":1000,"boarding-food":2000}
  };
  const away=educationResidenceAwayMonths(s,s.year),before=s.house.cash;
  const room=educationSettleVerifiedMobility(s,{
    kind:"boarding-room",residenceContractId:id,year:s.year,month:4});
  const food=educationSettleVerifiedMobility(s,{
    kind:"boarding-food",residenceContractId:id,year:s.year,month:4});
  const repeat=educationSettleVerifiedMobility(s,{
    kind:"boarding-room",residenceContractId:id,year:s.year,month:4});
  const invoiceIds=Object.keys(s.educationFinance.invoices);
  let rejectedRent=false;try{
    educationEnsureVerifiedMobilityInvoice(s,{
      kind:"rent",residenceContractId:id,year:s.year,month:4
    });
  }catch{rejectedRent=true;}
  s.educationMobility.transportTransactions["edu-travel:test"]={
    id:"edu-travel:test",kind:"commute-pass",status:"confirmed",
    year:s.year,month:4,providerId:"route:test",amount:650
  };
  const commute=educationSettleVerifiedMobility(s,{
    kind:"commute-pass",transactionId:"edu-travel:test",year:s.year,month:4});
  const duplicateCommute=educationSettleVerifiedMobility(s,{
    kind:"commute-pass",transactionId:"edu-travel:test",year:s.year,month:4});
  return {away,price:before-s.house.cash,room:room?.amount,food:food?.amount,
    repeat:repeat?.id===room?.id,rentRejected:rejectedRent,
    invoiceCount:invoiceIds.length,commute:commute?.amount,
    duplicateCommute:duplicateCommute?.id===commute?.id,
    travelInvoices:Object.values(s.educationFinance.invoices)
      .filter(x=>x.kind==="commute-pass").length,
    audit:educationCheckFinanceInvariants(s)};
});
assert.equal(mobility.away,6);
assert.equal(mobility.price,3650);
assert.equal(mobility.room,1000);
assert.equal(mobility.food,2000);
assert.equal(mobility.repeat,true);
assert.equal(mobility.rentRejected,true);
assert.equal(mobility.invoiceCount,2);
assert.equal(mobility.commute,650);
assert.equal(mobility.duplicateCommute,true);
assert.equal(mobility.travelInvoices,1);
assert.deepEqual(mobility.audit,[]);
fresh("クルビア",22);
const migrated=run(function(){
  const s=S;
  s.educationFinance={version:1,receipts:[{
    id:"legacy:case:exam",kind:"exam",personal:2500,household:1100,
    caseId:"legacy:case",settledAt:{year:s.year,month:4}
  }]};
  const cashBefore=s.cash,houseBefore=s.house.cash,
    personal=educationAnnualOutflow(s,s.year,"personal"),
    household=educationAnnualOutflow(s,s.year,"household");
  return {personal,household,
    receipts:Object.keys(s.educationFinance.receipts).length,
    invoiceCount:Object.keys(s.educationFinance.invoices).length,
    noRecharged:s.cash===cashBefore&&s.house.cash===houseBefore,
    audit:educationCheckFinanceInvariants(s)};
});
assert.equal(migrated.personal,2500);
assert.equal(migrated.household,1100);
assert.equal(migrated.receipts,2);
assert.equal(migrated.invoiceCount,1);
assert.equal(migrated.noRecharged,true);
assert.deepEqual(migrated.audit,[]);
fresh("龍門",12);
const panel=run(function(){
  const s=S;s.age=12;s.cash=1000;s.house.cash=20000;
  const invoice=educationEnsureInvoice(s,{id:"tuition:panel:1",kind:"tuition",
    institutionId:"school:panel",amount:10000});
  educationSettleInvoice(s,invoice);
  s.flow={year:s.year,expense:{education:0},income:{}};
  const previous=JSON.stringify(s.educationFinance),
    output={fn:{innerHTML:""},fh:{innerHTML:""},ch:{innerHTML:""}},
    services={m:value=>String(value),$:id=>output[id],
      householdStrained:()=>false,
      annualEconomyHistoryMarkup:()=>"",
      choiceEconomyHistoryMarkup:()=>""};
  renderEconomyPanel(s,services);
  return {unchanged:previous===JSON.stringify(s.educationFinance),
    text:output.fn.innerHTML,paid:s.educationFinance.invoices[invoice.id].paid};
});
assert.equal(panel.unchanged,true,"rendering finances must not update ledger");
assert.equal(panel.paid,10000);
for(const label of ["当年教育費：本人財布からの実支払",
  "当年教育費：家計財布からの実支払",
  "現在の教育機関への授業料未納額（別建て）",
  "うち学生貸付の未返済契約残高"])
  assert(panel.text.includes(label),"missing education finance panel label: "+label);
assert(panel.text.includes("家計財布からの実支払</dt><dd>10000"),
  "household education spending is shown once");
console.log("PASS P07: quote, invoice, mixed payment, grant, loan, refund, annual rollup and no double charge");
