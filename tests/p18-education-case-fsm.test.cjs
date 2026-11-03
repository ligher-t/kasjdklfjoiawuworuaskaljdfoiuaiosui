'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),vm=require('node:vm');
const {context,setup}=require('./support/annual-cases.cjs');
const {ctx}=context(path.resolve(__dirname,'..'));
setup(ctx,{id:'education-cases',seed:112996,region:'龍門',age:6});
const run=fn=>JSON.parse(vm.runInContext('JSON.stringify(('+fn.toString()+')())',ctx,{timeout:20000}));
const basic=run(function(){
  const s=S;
  s.year=1085;s.age=6;s.mo=3;s.cash=9000000;
  s.res=REG.find(x=>x.n==="龍門");s.home="移動都市";
  s.local={kind:"移動都市の居住区",city:"龍門",placeId:"city:龍門:龍門",
    districtId:"district:case-test",access:0.8,hazard:0.2};
  s.care.parentKeys=["fa"];s.par.fa.d=0;s.par.fa.separated=false;
  ensureResidenceIdentity(s);ensureEducationWorldForResidence(s);
  s.educationDecision={kind:"primary",year:s.year};
  const beforeCash=s.cash,beforeHouse=s.house.cash;
  const begin=educationCaseAction(s,"case:begin:primary:primary:1");
  const item=educationActiveCase(s),firstId=item.id,firstSeq=s.educationCases.sequence;
  const candidates=educationCaseCandidates(s),app=educationCasePreflight(s,candidates[0]);
  const repeat=educationCaseAction(s,"case:begin:primary:primary:1");
  const event=EV.find(e=>e.id==="education_case_review");
  const eligible=!!event&&elig(event,s,tags(s));
  return {begin,repeat,phase:item.phase,kind:item.kind,stage:item.stage,
    stepsUsed:item.stepsUsed,id:firstId,seq:firstSeq,sequence:s.educationCases.sequence,
    cashSame:beforeCash===s.cash,houseSame:beforeHouse===s.house.cash,
    candidateCount:candidates.length,preflight:app,eligible,
    shown:event.c.filter(c=>ok(c.show,s,tags(s))).length,
    presentation:educationCasePresentation(s),source:candidates[0]?.informationSource,
    known:Object.keys(s.educationAccess.knownOfferings).length,
    consentCount:Object.keys(s.educationMobility?.consentRecords||{}).length,
    decision:s.educationDecision.kind,
    auditIssues:auditLifeState(s).filter(x=>x.includes("進路")||x.includes("教育上"))};
});
assert.equal(basic.begin,true);
assert.equal(basic.repeat,false);
assert.equal(basic.phase,"planning");
assert.equal(basic.kind,"primary");
assert.equal(basic.stage,"primary");
assert.equal(basic.stepsUsed,1);
assert.equal(basic.seq,basic.sequence);
assert.equal(basic.cashSame,true);
assert.equal(basic.houseSame,true);
assert(basic.candidateCount>=1);
assert.equal(basic.source,"in-person-inquiry");
assert(basic.known>=1);
assert.equal(basic.eligible,true);
assert(basic.shown<=9);
assert.equal(basic.decision,"case-review");
assert.equal(basic.consentCount,0,"school inquiries must not imply parental consent");
assert.deepEqual(basic.auditIssues,[]);
assert(!basic.presentation.includes("edu-inst:"));
const admission=run(function(){
  const s=S,item=educationActiveCase(s),before=s.cash,houseBefore=s.house.cash;
  const original=educationCaseCandidates(s)[0],preflight=educationCasePreflight(s,original);
  const chosenParent="fa",id=educationActiveCase(s).id+":"+original.institutionId;
  educationCreateMobilityState(s);
  for(const purpose of ["daily-commute","exam-visit"]){
    s.educationMobility.consentRecords[id+":"+purpose]={
      personId:"protagonist",institutionId:original.institutionId,
      purpose,consenterPersonId:chosenParent,consentState:"granted",
      evidenceRef:"test-fixture-explicit-parent-response",
      validFrom:{year:s.year,month:1},validThrough:{year:s.year,month:12}
    };
    s.educationMobility.escortRecords[id+":"+purpose]={
      personId:"protagonist",institutionId:original.institutionId,purpose,
      escortPersonId:chosenParent,status:"verified",evidenceRef:"test-fixture-escort-response",
      validFrom:{year:s.year,month:1},validThrough:{year:s.year,month:12}
    };
  }
  const selected=educationCaseAction(s,"case:select:0");
  const current=educationActiveCase(s),record=s.educationCases.items[item.id],
    notice=s.educationAccess.notices[record.applicationId];
  const result={selected,preflight,accepted:notice?.result==="accepted",
    reason:record.reason,phase:record.phase,applicationId:record.applicationId,
    cashSame:before===s.cash,houseSame:houseBefore===s.house.cash,
    examReceipts:(s.educationFinance?.receipts||[]).filter(x=>x.kind==="exam").length,
    active:!!current};
  if(!result.accepted)return result;
  const contract=educationCaseCommitEligibility(s),performed=educationCaseCommit(s);
  const after=educationCaseCommit(s),done=s.educationCases.items[item.id];
  return {...result,contract,performed,after,terminal:done.reason,
    offeringCommitted:s.educationPath?.offeringId===original.offeringId,
    institutionCommitted:s.educationPath?.institutionId===original.institutionId,
    awards:s.educationRecord.awards.length,
    tuitionReceipts:s.educationFinance.receipts.filter(x=>x.kind==="tuition").length,
    activeAfter:!!educationActiveCase(s)};
});
assert.equal(admission.selected,true);
assert.equal(admission.examReceipts,0);
assert.equal(admission.cashSame,true);
assert.equal(admission.houseSame,true);
assert(admission.applicationId.startsWith(basic.id+":application:"));
if(admission.accepted){
  assert.equal(admission.phase,"contract");
  assert.equal(admission.contract.allowed,true);
  assert.equal(admission.performed,true);
  assert.equal(admission.after,false);
  assert.equal(admission.terminal,"admitted");
  assert.equal(admission.offeringCommitted,true);
  assert.equal(admission.institutionCommitted,true);
  assert.equal(admission.tuitionReceipts,1);
  assert.equal(admission.activeAfter,false);
  assert.equal(admission.awards,0);
}else{
  assert.equal(admission.reason,"institution-refused");
  assert.equal(admission.active,false);
}
const noSchool=run(function(){
  const s=S;s.year=1086;s.age=7;s.mo=2;
  s.res=REG.find(x=>x.n==="カズデル");s.home="固定集落";
  s.local={kind:"辺境・移動の多い居住地",city:null,placeId:"settlement:カズデル:5511:1",
    districtId:"district:no-school",access:0.11,hazard:0.52};
  ensureResidenceIdentity(s);ensureEducationWorldForResidence(s);
  const money=s.cash,house=s.house.cash;
  const created=educationCaseAction(s,"case:begin:primary:primary:1"),
    count=educationCaseCandidates(s).length,exit=educationCaseAction(s,"case:defer");
  const history=s.educationCases.history.at(-1);
  return {created,count,exit,reason:history.reason,active:educationActiveCase(s),
    moneySame:money===s.cash,houseSame:house===s.house.cash,
    feeRecords:(s.educationFinance?.receipts||[]).filter(x=>x.caseId===history.id).length};
});
assert.equal(noSchool.created,true);
assert.equal(noSchool.count,0);
assert.equal(noSchool.exit,true);
assert.equal(noSchool.reason,"voluntary-defer");
assert.equal(noSchool.active,null);
assert.equal(noSchool.moneySame,true);
assert.equal(noSchool.houseSame,true);
assert.equal(noSchool.feeRecords,0);
const expiry=run(function(){
  const s=S;s.year=1087;s.age=8;s.mo=3;
  const before=s.cash,houseBefore=s.house.cash;
  educationCaseAction(s,"case:begin:primary:primary:1");
  const item=educationActiveCase(s),id=item.id,copy=JSON.parse(JSON.stringify(s));
  educationExpireCases(s,1088);
  const history=s.educationCases.history.at(-1);
  educationExpireCases(s,1088);
  return {id,expired:history.reason,
    records:s.educationCases.history.filter(x=>x.id===id).length,
    moneySame:before===s.cash,houseSame:houseBefore===s.house.cash,
    cloneCaseId:copy.educationCases.activeCaseId};
});
assert.equal(expiry.expired,"year-expired");
assert.equal(expiry.records,1);
assert.equal(expiry.moneySame,true);
assert.equal(expiry.houseSame,true);
assert.equal(expiry.cloneCaseId,expiry.id);
const contract=run(function(){
  const s=S,data=educationCasesState(s),all=Object.values(data.items);
  return {count:all.length,ids:new Set(all.map(x=>x.id)).size,
    active:data.activeCaseId,phases:EDUCATION_CASE_PHASES,
    limit:EDUCATION_CASE_MAX_CHOICES,
    fallback:EV.find(e=>e.id==="education_case_review").c.some(x=>
      typeof x.l==="string"&&x.l.includes("見送る"))};
});
assert.equal(contract.count,contract.ids);
assert.equal(contract.active,null);
assert.deepEqual(contract.phases,["intent","planning","application","contract","continuity","resolved"]);
assert.equal(contract.limit,3);
assert.equal(contract.fallback,true);
const guardianScope=run(function(){
  const s=S;s.year=1088;s.age=9;s.mo=3;s.cash=9000000;
  s.educationPath=null;s.study=null;s.fl.sch=0;
  s.res=REG.find(x=>x.n==="龍門");s.home="移動都市";
  s.local={kind:"移動都市の居住区",city:"龍門",placeId:"city:龍門:龍門",
    districtId:"district:guardian-review",access:0.8,hazard:0.2};
  ensureResidenceIdentity(s);ensureEducationWorldForResidence(s);
  s.care.parentKeys=["fa"];s.par.fa.d=0;s.par.fa.separated=false;s.par.fa.health=80;
  const begin=educationCaseAction(s,"case:begin:primary:primary:1"),
    item=educationActiveCase(s),before=item.stepsUsed,
    row=educationCaseCandidate(s,0),pending=educationCasePreflight(s,row);
  const searched=educationCaseAction(s,"case:search-adjacent"),
    afterSearch=item.stepsUsed,
    repeatSearch=educationCaseAction(s,"case:search-adjacent");
  s.care.parentKeys=[];
  const denied=educationCasePreflight(s,row),
    deniedText=educationCaseReasonText(s,0);
  s.care.parentKeys=["fa"];
  const bank=s.cash,house=s.house.cash,
    selected=educationCaseAction(s,"case:select:0");
  const answers=Object.values(s.educationMobility.consentRecords).filter(x=>
    x.institutionId===row.institutionId &&
    x.evidenceRef===item.id+":guardian-response");
  const end=s.educationCases.items[item.id],
    receiptCount=(s.educationFinance?.receipts||[]).filter(x=>x.caseId===item.id).length;
  return {begin,before,pending,searched,afterSearch,repeatSearch,denied,deniedText,
    selected,answers:answers.map(x=>({purpose:x.purpose,state:x.consentState,evidence:x.evidenceRef})),
    phase:end.phase,terminal:end.reason,receiptCount,uncharged:bank===s.cash&&house===s.house.cash,
    auditIssues:auditLifeState(s).filter(x=>x.includes("進路案件")||x.includes("教育上"))};
});
assert.equal(guardianScope.begin,true);
assert(guardianScope.pending.allowed,"a recorded parent can be consulted as part of a real application");
assert.equal(guardianScope.pending.requiresGuardianDecision,true);
assert.equal(guardianScope.before,1);
assert.equal(guardianScope.searched,true);
assert.equal(guardianScope.afterSearch,1,"adjacent search is an information action, not a terminal decision");
assert.equal(guardianScope.repeatSearch,false);
assert.equal(guardianScope.denied.allowed,false);
assert.equal(guardianScope.denied.reasonCodes[0],"no-guardian");
assert.equal(guardianScope.deniedText,"未成年者の出願に必要な保護者の同意が確かめられていない。");
assert.equal(guardianScope.selected,true);
assert.equal(guardianScope.answers.length,2);
assert(guardianScope.answers.every(row=>row.evidence?.includes("guardian-response")));
assert(guardianScope.answers.some(row=>row.purpose==="daily-commute"));
assert(guardianScope.answers.some(row=>row.purpose==="exam-visit"));
assert.equal(guardianScope.uncharged,true);
assert.equal(guardianScope.receiptCount,0);
assert.deepEqual(guardianScope.auditIssues,[]);
console.log("PASS P06/P16 student discovery, admission, termination and 3-choice limits");
