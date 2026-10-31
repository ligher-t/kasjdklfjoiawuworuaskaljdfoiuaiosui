'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),vm=require('node:vm');
const annual=require('./support/annual-cases.cjs');
const {ctx}=annual.context(path.resolve(__dirname,'..'));
annual.setup(ctx,{id:'p0-school-progression',seed:981230,region:'クルビア',age:5});
function scenario(){
  const s=S,school=activeFacility(s,'school');
  if(!school)throw Error('school facility not found');
  school.status='available';s.house.cash=50000000;s.cash=15000000;
  s.age=6;s.year=s.by+6;educationAdvanceYear(s);
  const primaryPending=s.educationDecision?.kind==='primary';
  DEBUG_RANDOM=()=>0.0001;TRACE_RESOLUTION={id:'sch',label:'学校へ通わせる'};
  educationApplyAction(s,'primary');TRACE_RESOLUTION=null;DEBUG_RANDOM=null;
  const primaryEntered=s.educationPath.stage==='primary'&&s.fl.sch===1;
  const transfer=JSON.parse(JSON.stringify(s));
  transfer.age=7;transfer.year=transfer.by+7;
  const oldSite=activeFacility(transfer,'school');
  const otherSite=localSites(transfer.community,'school').find(x=>x.id!==oldSite.id);
  if(!otherSite)throw Error('no other synthetic school site');
  oldSite.status='limited';otherSite.status='available';
  educationAdvanceYear(transfer);
  const transferOffered=transfer.educationDecision?.kind==='transfer' &&
    educationLive(transfer),
    transferAuditClear=!auditLifeState(transfer).includes('教育上の必須進路判断が不正');
  TRACE_RESOLUTION={id:'education_transfer_review'};
  educationApplyAction(transfer,'transfer-school');
  TRACE_RESOLUTION=null;
  const transferRecorded=educationLive(transfer)&&
    transfer.educationDecision===null&&
    transfer.siteAffiliations.school.facilityId===otherSite.id&&
    transfer.educationPath.history.some(h=>h.action==='transferred');
  for(let age=7;age<=15;age++){s.age=age;s.year=s.by+age;educationAdvanceYear(s);}
  const lowerCompleted=educationHas(s,'primary')&&educationHas(s,'lower')&&s.educationDecision?.kind==='upper-path';
  DEBUG_RANDOM=()=>0.01;educationApplyAction(s,'enter-upper');DEBUG_RANDOM=null;
  const upperEntered=s.educationPath.stage==='upper';
  for(let age=16;age<=18;age++){s.age=age;s.year=s.by+age;educationAdvanceYear(s);}
  const upperCompleted=educationHas(s,'upper')&&s.educationPath.status==='completed',
    noDegree=!educationCredential(s,'university');
  s.k=96;socialModel(s).literacy=96;s.cash=40000000;s.job=24;
  const examChance=educationExam(s,'university',3).chance;
  DEBUG_RANDOM=()=>0.001;TRACE_RESOLUTION={id:'higher_ed',label:'最高水準の大学へ挑戦する'};
  educationApplyAction(s,'apply:university:3');TRACE_RESOLUTION=null;DEBUG_RANDOM=null;
  const universityEntered=educationLive(s)&&s.educationPath.stage==='university'&&s.job===0,
    beforeAward=!educationCredential(s,'university'),enrolledSince=s.educationPath.stageStartYear;
  for(let age=19;age<=22;age++){s.age=age;s.year=s.by+age;educationAdvanceYear(s);}
  const final={status:s.educationPath.status,years:s.educationPath.yearsCompleted,
    yearsElapsed:s.year-enrolledSince,certificate:educationCredential(s,'university'),
    awards:s.educationRecord.awards,study:s.study};
  const low=JSON.parse(JSON.stringify(s));low.k=12;low.socialLearning.literacy=20;low.fl.uni=0;
  const lowChance=educationExam(low,'university',3).chance;
  const unqualified=JSON.parse(JSON.stringify(low));unqualified.educationPath.completed=[];
  const unqualifiedAllowed=educationExam(unqualified,'university',1).allowed;
  const denied=JSON.parse(JSON.stringify(s));denied.inf=1;denied.fl.dg=1;
  denied.res=REG.find(r=>r.n==='ウルサス');
  const privateGate=educationCanEnter(denied,'upper').allowed;
  const deniedSite=activeFacility(denied,'school');
  recordInfectionAwareness(denied,{subject:'protagonist',audience:'school',
    certainty:'confirmed',source:'self-disclosure',consent:'voluntary',recipientRef:deniedSite.id});
  const knownGate=educationBarrier(denied,'upper').chance;
  const mixed=JSON.parse(JSON.stringify(s));mixed.age=16;
  mixed.cash=60000;mixed.house.cash=40000;
  const mixedFeePaid=educationChargeFee(mixed,100000,'upper') &&
    mixed.cash===0&&mixed.house.cash===0&&
    mixed.educationAnnualFee?.payer==='mixed'&&
    mixed.educationAnnualFee?.paidByHousehold===40000,
    mixedAuditClear=!auditLifeState(mixed).includes('年間教育費と支払主体が不正');
  const poor=JSON.parse(JSON.stringify(s));poor.res=REG.find(r=>r.n==='サルゴン');
  poor.educationPath={version:1,stage:'upper',tier:1,mode:'full-time',startedYear:1100,
    stageStartYear:1100,lastProcessedYear:1100,status:'enrolled',
    yearsCompleted:0,duration:3,completed:['primary','lower'],history:[]};
  poor.age=21;poor.year=1101;poor.cash=0;poor.house.cash=0;
  // Isolate school finance from a random closed local facility.
  activeFacility(poor,'school').status='available';
  educationAdvanceYear(poor);
  return{primaryPending,primaryEntered,transferOffered,transferRecorded,lowerCompleted,upperEntered,upperCompleted,
    noDegree,examChance,universityEntered,beforeAward,final,lowChance,
    unqualifiedAllowed,privateGate,knownGate,mixedFeePaid,transferAuditClear,mixedAuditClear,
    playerUpperDecision:EV.find(e=>e.id==='education_upper_path')?.who==='self',
    underfunded:poor.educationPath.status,
    audit:auditLifeState(s)};
}
const result=vm.runInContext('('+scenario.toString()+')()',ctx,{timeout:18000});
assert.equal(result.primaryPending,true,'age-six school entry is required');
assert.equal(result.primaryEntered,true,'admission begins a course');
assert.equal(result.transferOffered,true,'school site closure offers an actionable player transfer');
assert.equal(result.transferRecorded,true,'transferring retains enrollment and records the new actual site');
assert.equal(result.transferAuditClear,true,'a valid transfer decision passes the state audit');
assert.equal(result.lowerCompleted,true,'primary and lower secondary complete normally');
assert.equal(result.upperEntered,true,'upper secondary follows a choice');
assert.equal(result.upperCompleted,true,'upper secondary completes on time');
assert.equal(result.noDegree,true,'secondary completion is not a university diploma');
assert(result.examChance>0.6,'well-prepared elite applicants mostly pass');
assert.equal(result.universityEntered,true,'admitted full-time students leave regular employment');
assert.equal(result.beforeAward,true,'admission never confers the diploma');
assert.equal(result.final.status,'completed');
assert.equal(result.final.yearsElapsed,4,'the university lasts four elapsed years');
assert.equal(result.final.certificate,true,'graduates earn a recorded credential');
assert.equal(result.final.awards.length,1);
assert.equal(result.final.study,null,'study and fee states end at graduation');
assert(result.lowChance<0.05,'weak preparation almost always fails elite examination');
assert.equal(result.unqualifiedAllowed,false,'no secondary bypass');
assert.equal(result.privateGate,true,'private medical diagnosis is not automatically known to school');
assert(result.knownGate<1,'confirmed school awareness changes the institution-specific admission assessment');
assert.equal(result.mixedFeePaid,true,'actual tuition can be shared between caregiver and personal funds');
assert.equal(result.mixedAuditClear,true,'a valid mixed payer split passes the state audit');
assert.equal(result.playerUpperDecision,true,'school continuation is a player decision, not a silent parent draw');
assert.equal(result.underfunded,'withdrawn','unpaid education is never left pending forever');
assert.deepEqual(Array.from(result.audit),[],'completed education validates in current save state');
console.log('PASS school progression, multi-tier admissions, tuition and graduation');
